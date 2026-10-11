"""Artifact identity and loading contract shared by evaluation and API."""
import hashlib
import json
from pathlib import Path
import joblib
import numpy as np
try:
    from .schema import CSV_FEATURES, FEATURES
except ImportError:
    from schema import CSV_FEATURES, FEATURES


def sha256(path):
    return hashlib.sha256(Path(path).read_bytes()).hexdigest()


def json_sha256(path):
    document = json.loads(Path(path).read_text(encoding='utf-8'))
    canonical = json.dumps(document, sort_keys=True, separators=(',', ':'), ensure_ascii=True)
    return hashlib.sha256(canonical.encode('ascii')).hexdigest()


def logit(probability):
    clipped = np.clip(np.asarray(probability), 1e-7, 1 - 1e-7)
    return np.log(clipped / (1 - clipped)).reshape(-1, 1)


def calibrated_probability(calibrator, raw_probability):
    if calibrator is None:
        return np.asarray(raw_probability)
    return calibrator.predict_proba(logit(raw_probability))[:, 1]


def validate_model(model, scaler):
    if scaler.n_features_in_ != len(FEATURES) or model.n_features_in_ != len(FEATURES):
        raise ValueError('Incompatible feature count')
    if list(getattr(scaler, 'feature_names_in_', CSV_FEATURES)) != CSV_FEATURES:
        raise ValueError('Incompatible feature order')
    if list(model.classes_) != [0, 1]:
        raise ValueError('Expected binary classes [0, 1]')
    if model.get_booster().attr('objective') == 'multi:softprob':
        raise ValueError('Expected binary classifier')


def load_runtime(root, config_path=None):
    root = Path(root).resolve()
    config_path = Path(config_path) if config_path else root / 'active_artifact.json'
    if config_path.exists():
        if not config_path.is_file():
            raise ValueError('Active configuration must be a JSON file')
        config = json.loads(config_path.read_text(encoding='utf-8'))
        artifact_path = (root / config['artifact_path']).resolve()
        if not artifact_path.is_relative_to(root):
            raise ValueError('Artifact must stay inside ml_api')
        digest = sha256(artifact_path)
        if digest != config['artifact_sha256']:
            raise ValueError('Artifact SHA-256 mismatch')
        bundle = joblib.load(artifact_path)
        if bundle['format_version'] != 1 or bundle['feature_order'] != CSV_FEATURES:
            raise ValueError('Invalid artifact contract')
        model, scaler, calibrator = bundle['model'], bundle['scaler'], bundle['calibrator']
        validate_model(model, scaler)
        if bundle['evaluation']['dataset_sha256'] != config['dataset_sha256']:
            raise ValueError('Dataset identity mismatch')
        if 'evaluation_manifest' in config:
            manifest_path = (root / config['evaluation_manifest']).resolve()
            if not manifest_path.is_relative_to(root):
                raise ValueError('Evaluation manifest must stay inside ml_api')
            if json_sha256(manifest_path) != config['evaluation_manifest_sha256']:
                raise ValueError('Evaluation manifest SHA-256 mismatch')
            manifest = json.loads(manifest_path.read_text(encoding='utf-8'))
            if (manifest['status'] != 'completed'
                    or manifest['api_artifact']['sha256'] != digest
                    or manifest['api_artifact']['metrics'] != bundle['evaluation']['metrics']
                    or manifest['csv_sha256'] != config['dataset_sha256']):
                raise ValueError('Evaluation manifest and artifact disagree')
        return model, scaler, calibrator, {
            'mode':'evaluated_release', 'artifact_sha256':digest,
            'model_name':bundle['model_name'], 'evaluation':bundle['evaluation'],
            'calibration':'sigmoid on disjoint calibration partition',
            'target_definition':bundle['target_definition'],
            'shap_output_space':'raw_model_log_odds',
        }
    model_path, scaler_path = root / 'xgboost_diabetes_model.pkl', root / 'scaler.pkl'
    model, scaler = joblib.load(model_path), joblib.load(scaler_path)
    validate_model(model, scaler)
    return model, scaler, None, {'mode':'legacy_unverified',
        'artifact_sha256':sha256(model_path), 'scaler_sha256':sha256(scaler_path),
        'evaluation':None, 'calibration':'unknown', 'target_definition':'unknown'}
