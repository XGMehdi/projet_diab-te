"""Verify the active API against every exported test prediction and endpoint samples."""
import argparse
import json
from datetime import datetime, timezone
from pathlib import Path
import numpy as np
import pandas as pd
from fastapi.testclient import TestClient
try:
    from . import main
    from .artifacts import calibrated_probability, sha256
    from .schema import FEATURES, CSV_FEATURES
    from .training import load_data, evaluate, calibration_bins
except ImportError:
    import main
    from artifacts import calibrated_probability, sha256
    from schema import FEATURES, CSV_FEATURES
    from training import load_data, evaluate, calibration_bins

ROOT = Path(__file__).resolve().parent

def verify(csv_path, release_path):
    release = Path(release_path).resolve()
    manifest = json.loads((release/'manifest.json').read_text(encoding='utf-8'))
    if sha256(csv_path) != manifest['csv_sha256']:
        raise ValueError('Wrong test dataset')
    info = TestClient(main.app).get('/model-info')
    if info.status_code != 200:
        raise ValueError('Configured API did not load')
    info = info.json()
    if info['mode'] != 'evaluated_release' or info['artifact_sha256'] != manifest['api_artifact']['sha256']:
        raise ValueError('API does not load the evaluated release')
    X,y,_,_ = load_data(csv_path,manifest['target'])
    indices = manifest['test_rows']
    expected = pd.read_csv(release/(manifest['api_model_name']+'_predictions.csv'))
    np.testing.assert_array_equal(expected['row'], indices)
    np.testing.assert_array_equal(expected['target'],y.iloc[indices])
    raw = main.model.predict_proba(main.scaler.transform(X.iloc[indices]))[:,1]
    served = calibrated_probability(main.calibrator,raw)
    np.testing.assert_allclose(served,expected['probability'],atol=1e-12,rtol=0)
    metrics = evaluate(y.iloc[indices],served)
    _,metrics['ece_10_uniform_bins'] = calibration_bins(y.iloc[indices],served)
    for name,value in metrics.items():
        np.testing.assert_allclose(value,manifest['api_artifact']['metrics'][name],atol=1e-12,rtol=0)
    sample = np.random.default_rng(42).choice(len(indices),min(100,len(indices)),replace=False)
    client = TestClient(main.app)
    errors = []
    for position in sample:
        row = X.iloc[indices[position]]
        payload = dict(zip(FEATURES,map(float,row[CSV_FEATURES])))
        payload['sex'] = 'MALE' if payload['sex'] else 'FEMALE'
        response = client.post('/predict',json=payload)
        if response.status_code != 200:
            raise ValueError(response.text)
        body = response.json()
        if body['modelArtifactSha256'] != info['artifact_sha256']:
            raise ValueError('Endpoint artifact differs')
        error = abs(body['riskScore'] - expected.iloc[position]['probability'])
        if error > 1e-10:
            raise ValueError('Endpoint and evaluation disagree')
        shap_values = json.loads(body['shapValuesAsJsonString'])
        if list(shap_values) != FEATURES:
            raise ValueError('Wrong SHAP feature order')
        np.testing.assert_allclose(1/(1+np.exp(-(body['shapBaseValue']+sum(shap_values.values())))),body['rawModelProbability'],atol=1e-5)
        errors.append(error)
    report = {'status':'passed','verified_at_utc':datetime.now(timezone.utc).isoformat(),
              'artifact_sha256':info['artifact_sha256'],'dataset_sha256':manifest['csv_sha256'],
              'full_test_probabilities_verified':len(indices),'full_test_metrics_verified':metrics,
              'http_prediction_samples_verified':len(sample),'http_max_absolute_error':max(errors),
              'http_sample_test_positions':sample.tolist(),'shap_additivity_samples_verified':len(sample)}
    (release/'api_verification.json').write_text(json.dumps(report,indent=2)+'\n',encoding='utf-8')
    print(json.dumps(report,indent=2))
    return report

if __name__ == '__main__':
    parser = argparse.ArgumentParser()
    parser.add_argument('--csv',required=True)
    parser.add_argument('--release',required=True)
    args = parser.parse_args()
    verify(args.csv,args.release)
