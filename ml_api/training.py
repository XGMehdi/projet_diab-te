"""Reproducible binary benchmark; never overwrites deployed artifacts."""
import hashlib
import json
import platform
import subprocess
import sys
from importlib.metadata import version
from pathlib import Path

import joblib
import matplotlib
matplotlib.use('Agg')
import matplotlib.pyplot as plt
import numpy as np
import pandas as pd
from sklearn.calibration import CalibrationDisplay
from sklearn.dummy import DummyClassifier
from sklearn.ensemble import RandomForestClassifier
from sklearn.linear_model import LogisticRegression
from sklearn.metrics import (accuracy_score, average_precision_score, balanced_accuracy_score,
    brier_score_loss, classification_report, confusion_matrix, f1_score, log_loss,
    precision_score, recall_score, roc_auc_score, RocCurveDisplay, PrecisionRecallDisplay)
from sklearn.model_selection import StratifiedGroupKFold, cross_validate
from imblearn.pipeline import make_pipeline
from imblearn.over_sampling import SMOTENC
from sklearn.calibration import calibration_curve
from sklearn.base import clone
from datetime import datetime, timezone
try:
    from .artifacts import sha256, logit, calibrated_probability
except ImportError:
    from artifacts import sha256, logit, calibrated_probability
from sklearn.preprocessing import StandardScaler
from xgboost import XGBClassifier, DMatrix
try:
    from .schema import FEATURES, CSV_FEATURES
except ImportError:
    from schema import FEATURES, CSV_FEATURES

SEED = 42

def load_data(path, target):
    frame = pd.read_csv(path)
    required = CSV_FEATURES + [target]
    missing = set(required) - set(frame.columns)
    if missing:
        raise ValueError(f'Missing columns: {sorted(missing)}')
    frame = frame[required].apply(pd.to_numeric, errors='raise')
    if not np.isfinite(frame.to_numpy()).all():
        raise ValueError('Missing or non-finite data: resolve and document before training')
    if set(frame[target].unique()) != {0, 1}:
        raise ValueError('Explicit binary target {0,1} required; no automatic remapping')
    for name in CSV_FEATURES:
        values = frame[name]
        if name == 'BMI':
            valid = (values > 0).all()
        elif name in ['GenHlth', 'MentHlth', 'PhysHlth', 'Age']:
            low, high = {'GenHlth': (1,5), 'MentHlth': (0,30), 'PhysHlth': (0,30), 'Age': (1,13)}[name]
            valid = (values.between(low, high) & (values % 1 == 0)).all()
        else:
            valid = values.isin([0,1]).all()
        if not valid:
            raise ValueError(f'Invalid encoding: {name}')
    before = len(frame)
    frame = frame.drop_duplicates().reset_index(drop=True)
    X, y = frame[CSV_FEATURES], frame[target].astype(int)
    # Identical feature vectors stay together, even with contradictory labels.
    groups = pd.util.hash_pandas_object(X, index=False).to_numpy()
    return X, y, groups, before - len(frame)


def evaluate(y, probability):
    predicted = (probability >= .5).astype(int)
    return {'roc_auc': roc_auc_score(y, probability),
            'average_precision': average_precision_score(y, probability),
            'accuracy': accuracy_score(y, predicted),
            'balanced_accuracy': balanced_accuracy_score(y, predicted),
            'precision': precision_score(y, predicted, zero_division=0),
            'recall': recall_score(y, predicted, zero_division=0),
            'f1': f1_score(y, predicted, zero_division=0),
            'brier': brier_score_loss(y, probability),
            'log_loss': log_loss(y, probability, labels=[0,1])}


def calibration_bins(y, probability, n_bins=10):
    y, probability = np.asarray(y), np.asarray(probability)
    ids = np.minimum((probability * n_bins).astype(int), n_bins - 1)
    rows = []
    for i in range(n_bins):
        mask = ids == i
        count = int(mask.sum())
        rows.append({'bin':i, 'lower':i/n_bins, 'upper':(i+1)/n_bins,
            'count':count, 'mean_probability':float(probability[mask].mean()) if count else None,
            'observed_fraction':float(y[mask].mean()) if count else None})
    ece = sum(r['count'] / len(y) * abs(r['mean_probability'] - r['observed_fraction'])
              for r in rows if r['count'])
    return rows, float(ece)


def run_experiment(csv_path, output_dir, target='Diabetes_binary', provenance_path=None):
    path, output = Path(csv_path).resolve(), Path(output_dir).resolve()
    X, y, groups, duplicates = load_data(path, target)
    provenance = json.loads(Path(provenance_path).read_text(encoding='utf-8')) if provenance_path else None
    digest = sha256(path)
    if provenance and (provenance['sha256'] != digest or provenance['target'] != target):
        raise ValueError('Provenance does not match dataset')
    outer = list(StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEED).split(X,y,groups))
    test, calibration = outer[0][1], outer[1][1]
    train = np.setdiff1d(np.arange(len(y)), np.concatenate([test, calibration]))
    X_train, X_cal, X_test = X.iloc[train], X.iloc[calibration], X.iloc[test]
    y_train, y_cal, y_test = y.iloc[train], y.iloc[calibration], y.iloc[test]
    cv = list(StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEED + 1)
              .split(X_train, y_train, groups[train]))
    partitions = [(train,test),(train,calibration),(test,calibration)] + [(train[a],train[b]) for a,b in cv]
    for a,b in partitions:
        if set(y.iloc[a]) != {0,1} or set(y.iloc[b]) != {0,1}:
            raise ValueError('Insufficient class coverage for grouped five-fold evaluation')
        assert not set(groups[a]).intersection(groups[b])
    xgb_params = dict(n_estimators=200, max_depth=3, learning_rate=.05,
        subsample=.8, colsample_bytree=.8, objective='binary:logistic',
        eval_metric='logloss', tree_method='hist', random_state=SEED, n_jobs=1)
    categorical = [i for i,c in enumerate(CSV_FEATURES) if c not in ['BMI','MentHlth','PhysHlth']]
    models = {
        'dummy': make_pipeline(StandardScaler(), DummyClassifier(strategy='prior')),
        'logistic_regression': make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000, random_state=SEED)),
        'random_forest': make_pipeline(StandardScaler(), RandomForestClassifier(n_estimators=100, max_depth=12, min_samples_leaf=5, random_state=SEED, n_jobs=1)),
        'xgboost': make_pipeline(StandardScaler(), XGBClassifier(**xgb_params)),
        'xgboost_smotenc': make_pipeline(StandardScaler(), SMOTENC(categorical_features=categorical, random_state=SEED, k_neighbors=5), XGBClassifier(**xgb_params)),
    }
    output.mkdir(parents=True, exist_ok=False)
    scoring = {'roc_auc':'roc_auc', 'average_precision':'average_precision',
               'balanced_accuracy':'balanced_accuracy', 'f1':'f1', 'recall':'recall', 'brier':'neg_brier_score'}
    cv_rows = []
    for name,pipeline in models.items():
        print('Training CV:', name, flush=True)
        scores = cross_validate(pipeline,X_train,y_train,cv=cv,scoring=scoring,n_jobs=1,error_score='raise')
        for fold in range(5):
            cv_rows.append({'model':name,'fold':fold, **{metric:float(scores['test_'+metric][fold]) * (-1 if metric=='brier' else 1) for metric in scoring}})
    cv_frame = pd.DataFrame(cv_rows)
    cv_frame.to_csv(output/'cv_folds.csv',index=False)
    summary = cv_frame.groupby('model')[list(scoring)].agg(['mean','std'])
    summary.to_csv(output/'cv_summary.csv')
    ranking = cv_frame.groupby('model').average_precision.mean()
    winner = ranking.idxmax()
    # API requires an XGBoost model to keep the exact TreeSHAP contract.
    api_model_name = ranking.loc[['xgboost','xgboost_smotenc']].idxmax()
    rows, calibrators, artifact_records = [], {}, {}
    fig,axes = plt.subplots(1,3,figsize=(18,5))
    for name,pipeline in models.items():
        print('Fitting and evaluating:',name,flush=True)
        pipeline.fit(X_train,y_train)
        cal_raw = pipeline.predict_proba(X_cal)[:,1]
        # Sigmoid calibration uses only the untouched calibration partition.
        calibrator = LogisticRegression(C=1e6,max_iter=1000,random_state=SEED)
        calibrator.fit(logit(cal_raw),y_cal)
        calibrators[name] = calibrator
        raw = pipeline.predict_proba(X_test)[:,1]
        calibrated = calibrated_probability(calibrator,raw)
        for mode,probability in [('raw',raw),('sigmoid',calibrated)]:
            bins,ece = calibration_bins(y_test,probability)
            rows.append({'model':name,'calibration':mode, **evaluate(y_test,probability), 'ece_10_uniform_bins':ece})
            pd.DataFrame(bins).to_csv(output/f'{name}_{mode}_calibration_bins.csv',index=False)
            report = classification_report(y_test,probability >= .5,output_dict=True,zero_division=0)
            report['confusion_matrix_labels_0_1'] = confusion_matrix(y_test,probability >= .5,labels=[0,1]).tolist()
            (output/f'{name}_{mode}_report.json').write_text(json.dumps(report,indent=2),encoding='utf-8')
            CalibrationDisplay.from_predictions(y_test,probability,name=f'{name} {mode}',n_bins=10,ax=axes[2])
        pd.DataFrame({'row':test,'target':y_test.to_numpy(),'raw_probability':raw,'probability':calibrated}).to_csv(output/f'{name}_predictions.csv',index=False)
        RocCurveDisplay.from_predictions(y_test,calibrated,name=name,ax=axes[0])
        PrecisionRecallDisplay.from_predictions(y_test,calibrated,name=name,ax=axes[1])
        artifact_path = output/f'{name}_pipeline.joblib'
        joblib.dump(pipeline,artifact_path)
        artifact_records[name] = {'path':artifact_path.name,'sha256':sha256(artifact_path)}
    fig.tight_layout()
    fig.savefig(output/'evaluation.png',dpi=160)
    plt.close(fig)
    results = pd.DataFrame(rows).set_index(['model','calibration'])
    results.to_csv(output/'test_metrics.csv')
    pipeline = models[api_model_name]
    transformed = pipeline[0].transform(X_test.iloc[:min(500,len(X_test))])
    booster = pipeline[-1].get_booster()
    matrix = DMatrix(transformed,feature_names=booster.feature_names)
    contributions = booster.predict(matrix,pred_contribs=True,approx_contribs=False)
    np.testing.assert_allclose(contributions.sum(axis=1),booster.predict(matrix,output_margin=True),atol=1e-5,rtol=1e-5)
    pd.DataFrame(contributions,columns=FEATURES+['base_value']).to_csv(output/'xgboost_shap_log_odds.csv',index=False)
    pd.Series(np.abs(contributions[:,:-1]).mean(axis=0),index=FEATURES).sort_values().plot.barh(title=f'{api_model_name}: mean absolute TreeSHAP (raw log-odds)')
    plt.tight_layout()
    plt.savefig(output/'shap_importance.png',dpi=160)
    plt.close()
    evaluated_metrics = results.loc[(api_model_name,'sigmoid')].to_dict()
    bundle = {'format_version':1,'model_name':api_model_name,'model':pipeline[-1],
        'scaler':pipeline[0],'calibrator':calibrators[api_model_name],'feature_order':CSV_FEATURES,
        'target_definition':provenance['target_definition'] if provenance else 'User-supplied binary target; unspecified semantics',
        'evaluation':{'dataset_sha256':digest,'target':target,'test_rows':len(test),
                      'metrics':evaluated_metrics,'selection':'training CV average precision among XGBoost variants',
                      'calibration_rows':len(calibration),'training_rows':len(train)}}
    bundle_path = output/'api_bundle.joblib'
    joblib.dump(bundle,bundle_path)
    # Evaluate the exact serialized bundle that can later be activated.
    reloaded = joblib.load(bundle_path)
    raw = reloaded['model'].predict_proba(reloaded['scaler'].transform(X_test))[:,1]
    served = calibrated_probability(reloaded['calibrator'],raw)
    expected = pd.read_csv(output/f'{api_model_name}_predictions.csv')['probability'].to_numpy()
    np.testing.assert_allclose(served,expected,rtol=0,atol=1e-12)
    manifest = {'status':'completed','seed':SEED,'csv_sha256':digest,'target':target,
        'feature_order':CSV_FEATURES,'duplicates_removed':duplicates,
        'train_rows':train.tolist(),'calibration_rows':calibration.tolist(),'test_rows':test.tolist(),
        'cv_indices': [{'train':train[a].tolist(),'validation':train[b].tolist()} for a,b in cv],
        'class_counts':y.value_counts().to_dict(),
        'partition_class_counts':{n:y.iloc[i].value_counts().to_dict() for n,i in [('train',train),('calibration',calibration),('test',test)]},
        'selected_by_training_cv_average_precision':winner,'api_model_name':api_model_name,
        'api_artifact':{'path':bundle_path.name,'sha256':sha256(bundle_path),'metrics':evaluated_metrics,
                        'serialized_predictions_verified':True},
        'threshold':.5,'python':platform.python_version(),
        'versions':{p:version(p) for p in ['numpy','pandas','scikit-learn','xgboost','joblib','imbalanced-learn']},
        'model_parameters':{n:str(m.get_params()) for n,m in models.items()},
        'pipeline_artifacts':artifact_records,'legacy_artifacts_evaluated':False,
        'provenance':provenance,'completed_at_utc':datetime.now(timezone.utc).isoformat()}
    (output/'manifest.json').write_text(json.dumps(manifest,indent=2),encoding='utf-8')
    (output/'environment.txt').write_text(subprocess.check_output([sys.executable,'-m','pip','freeze'],text=True),encoding='utf-8')
    if provenance:
        (output/'dataset_provenance.json').write_text(json.dumps(provenance,indent=2),encoding='utf-8')
    report_lines = ['# Measured results', '', 'Rows: train / calibration / test: '+str((len(train),len(calibration),len(test))),
        'CSV SHA-256: `'+digest+'`','', 'Selected across all models using training CV: '+winner,
        'API XGBoost variant selected using training CV: '+api_model_name,'',
        'Threshold 0.5. Calibration uses a separate partition. ECE uses 10 equal-width bins.','',
        '| Model | Calibration | ROC-AUC | AP | Recall | F1 | Brier | Log-loss | ECE |',
        '|---|---|---:|---:|---:|---:|---:|---:|---:|']
    for (name,mode),row in results.iterrows():
        values = ' | '.join(f'{row[m]:.6f}' for m in ['roc_auc','average_precision','recall','f1','brier','log_loss','ece_10_uniform_bins'])
        report_lines.append(f'| {name} | {mode} | {values} |')
    report_lines += ['', 'API artifact SHA-256: `'+sha256(bundle_path)+'`',
        'The saved API bundle reproduces every exported test probability (absolute tolerance 1e-12).',
        'Raw SHAP explains the raw model margin; sigmoid calibration is a separate transformation.',
        'Historical models have unknown provenance and are not scored as if independently tested.']
    (output/'RESULTS.md').write_text('\n'.join(report_lines)+'\n',encoding='utf-8')
    return summary,results,manifest

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv',required=True)
    parser.add_argument('--output',required=True)
    parser.add_argument('--target',default='Diabetes_binary')
    parser.add_argument('--provenance')
    args = parser.parse_args()
    _,results,manifest = run_experiment(args.csv,args.output,args.target,args.provenance)
    print(results)
    print('API variant:',manifest['api_model_name'])
