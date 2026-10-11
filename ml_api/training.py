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
from sklearn.pipeline import make_pipeline
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


def run_experiment(csv_path, output_dir, target='Diabetes_binary'):
    path, output = Path(csv_path).resolve(), Path(output_dir).resolve()
    X, y, groups, duplicates = load_data(path, target)
    outer = StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEED)
    train, test = next(outer.split(X, y, groups))
    X_train, X_test, y_train, y_test = X.iloc[train], X.iloc[test], y.iloc[train], y.iloc[test]
    cv = list(StratifiedGroupKFold(n_splits=5, shuffle=True, random_state=SEED + 1)
              .split(X_train, y_train, groups[train]))
    for a, b in [(train, test)] + [(train[a], train[b]) for a,b in cv]:
        if set(y.iloc[a]) != {0,1} or set(y.iloc[b]) != {0,1}:
            raise ValueError('Insufficient class coverage for grouped five-fold evaluation')
        assert not set(groups[a]).intersection(groups[b])
    models = {
        'dummy': make_pipeline(StandardScaler(), DummyClassifier(strategy='prior')),
        'logistic_regression': make_pipeline(StandardScaler(), LogisticRegression(max_iter=2000, random_state=SEED)),
        'random_forest': make_pipeline(StandardScaler(), RandomForestClassifier(n_estimators=200, min_samples_leaf=5, random_state=SEED, n_jobs=1)),
        'xgboost': make_pipeline(StandardScaler(), XGBClassifier(n_estimators=200, max_depth=3, learning_rate=.05, subsample=.8, colsample_bytree=.8, objective='binary:logistic', eval_metric='logloss', tree_method='hist', random_state=SEED, n_jobs=1)),
    }
    output.mkdir(parents=True, exist_ok=False)
    scoring = {'roc_auc': 'roc_auc', 'average_precision': 'average_precision',
               'balanced_accuracy': 'balanced_accuracy', 'f1': 'f1',
               'recall': 'recall', 'brier': 'neg_brier_score'}
    cv_rows = []
    for name, pipeline in models.items():
        scores = cross_validate(pipeline, X_train, y_train, cv=cv, scoring=scoring,
                                n_jobs=1, error_score='raise')
        for fold in range(5):
            cv_rows.append({'model': name, 'fold': fold, **{
                metric: float(scores['test_' + metric][fold]) * (-1 if metric == 'brier' else 1)
                for metric in scoring}})
    cv_frame = pd.DataFrame(cv_rows)
    cv_frame.to_csv(output / 'cv_folds.csv', index=False)
    summary = cv_frame.groupby('model')[list(scoring)].agg(['mean','std'])
    summary.to_csv(output / 'cv_summary.csv')
    # Selection exclusively on training CV, before touching test scores.
    winner = cv_frame.groupby('model').average_precision.mean().idxmax()
    rows = []
    fig, axes = plt.subplots(1,3,figsize=(16,4))
    for name, pipeline in models.items():
        pipeline.fit(X_train, y_train)
        probability = pipeline.predict_proba(X_test)[:,1]
        rows.append({'model': name, **evaluate(y_test, probability)})
        pd.DataFrame({'row': test, 'target': y_test.to_numpy(), 'probability': probability}).to_csv(output / f'{name}_predictions.csv', index=False)
        report = classification_report(y_test, probability >= .5, output_dict=True, zero_division=0)
        report['confusion_matrix_labels_0_1'] = confusion_matrix(y_test, probability >= .5, labels=[0,1]).tolist()
        (output / f'{name}_report.json').write_text(json.dumps(report, indent=2), encoding='utf-8')
        RocCurveDisplay.from_predictions(y_test, probability, name=name, ax=axes[0])
        PrecisionRecallDisplay.from_predictions(y_test, probability, name=name, ax=axes[1])
        CalibrationDisplay.from_predictions(y_test, probability, name=name, n_bins=10, ax=axes[2])
        joblib.dump(pipeline, output / f'{name}_pipeline.joblib')
    fig.tight_layout()
    fig.savefig(output / 'evaluation.png', dpi=160)
    plt.close(fig)
    results = pd.DataFrame(rows).set_index('model')
    results.to_csv(output / 'test_metrics.csv')
    xgb = models['xgboost']
    transformed = xgb[0].transform(X_test.iloc[:min(500,len(X_test))])
    booster = xgb[-1].get_booster()
    matrix = DMatrix(transformed, feature_names=booster.feature_names)
    contributions = booster.predict(matrix, pred_contribs=True, approx_contribs=False)
    np.testing.assert_allclose(contributions.sum(axis=1), booster.predict(matrix, output_margin=True), atol=1e-5, rtol=1e-5)
    pd.DataFrame(contributions, columns=FEATURES + ['base_value']).to_csv(output / 'xgboost_shap_log_odds.csv', index=False)
    pd.Series(np.abs(contributions[:,:-1]).mean(axis=0), index=FEATURES).sort_values().plot.barh(title='Mean absolute TreeSHAP (test subset, log-odds)')
    plt.tight_layout()
    plt.savefig(output / 'shap_importance.png', dpi=160)
    plt.close()
    manifest = {'seed': SEED, 'csv_sha256': hashlib.sha256(path.read_bytes()).hexdigest(),
        'target': target, 'feature_order': CSV_FEATURES, 'duplicates_removed': duplicates,
        'train_rows': train.tolist(), 'test_rows': test.tolist(),
        'class_counts': y.value_counts().to_dict(), 'selected_by_training_cv_average_precision': winner,
        'threshold': .5, 'python': platform.python_version(),
        'versions': {p: version(p) for p in ['numpy','pandas','scikit-learn','xgboost','joblib']},
        'model_parameters': {n: str(m.get_params()) for n,m in models.items()},
        'legacy_artifacts_evaluated': False}
    (output / 'manifest.json').write_text(json.dumps(manifest, indent=2), encoding='utf-8')
    (output / 'environment.txt').write_text(subprocess.check_output([sys.executable,'-m','pip','freeze'], text=True), encoding='utf-8')
    return summary, results, manifest

if __name__ == '__main__':
    import argparse
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv', required=True)
    parser.add_argument('--output', required=True)
    parser.add_argument('--target', default='Diabetes_binary')
    args = parser.parse_args()
    _, results, manifest = run_experiment(args.csv, args.output, args.target)
    print(results)
    print('Selected using training CV:', manifest['selected_by_training_cv_average_precision'])
