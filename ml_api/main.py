import json
import logging
from pathlib import Path
from typing import Literal
import joblib
import numpy as np
import pandas as pd
from fastapi import FastAPI, HTTPException
from pydantic import BaseModel, Field
from xgboost import DMatrix
try:
    from .schema import FEATURES, CSV_FEATURES
except ImportError:
    from schema import FEATURES, CSV_FEATURES

app = FastAPI()
ROOT = Path(__file__).resolve().parent
try:
    from .artifacts import load_runtime, calibrated_probability
except ImportError:
    from artifacts import load_runtime, calibrated_probability

model = scaler = calibrator = None
model_info = {'mode': 'unavailable'}
try:
    model, scaler, calibrator, model_info = load_runtime(ROOT)
except Exception:
    logging.exception('Cannot load configured ML artifacts')

@app.get('/model-info')
def get_model_info():
    if model is None:
        raise HTTPException(503, 'ML artifacts unavailable')
    return model_info

class PredictionRequest(BaseModel):
    highBp: bool
    highChol: bool
    cholCheck: bool
    bmi: float = Field(gt=0, allow_inf_nan=False)
    smoker: bool
    stroke: bool
    heartDiseaseOrAttack: bool
    physActivity: bool
    fruits: bool
    veggies: bool
    hvyAlcoholConsump: bool
    genHlth: int = Field(ge=1, le=5)
    mentHlth: int = Field(ge=0, le=30)
    physHlth: int = Field(ge=0, le=30)
    diffWalk: bool
    sex: Literal['MALE', 'FEMALE']
    age: int = Field(ge=1, le=13, description='BRFSS category, not years')

def tree_shap(classifier, scaled):
    """Exact native TreeSHAP contributions in raw margin (log-odds)."""
    booster = classifier.get_booster()
    matrix = DMatrix(scaled, feature_names=booster.feature_names)
    end = getattr(classifier, 'best_iteration', booster.num_boosted_rounds() - 1) + 1
    contributions = booster.predict(matrix, pred_contribs=True, approx_contribs=False,
                                    iteration_range=(0, end))
    margin = booster.predict(matrix, output_margin=True, iteration_range=(0, end))
    if contributions.shape != (len(scaled), len(FEATURES) + 1):
        raise ValueError('Unexpected SHAP dimensions')
    np.testing.assert_allclose(contributions.sum(axis=1), margin, rtol=1e-5, atol=1e-5)
    return contributions

@app.post('/predict')
def predict_risk(request: PredictionRequest):
    if model is None or scaler is None:
        raise HTTPException(503, 'ML artifacts unavailable')
    row = request.model_dump()
    row['sex'] = int(request.sex == 'MALE')
    features = np.array([[float(row[name]) for name in FEATURES]])
    try:
        scaled = scaler.transform(pd.DataFrame(features, columns=CSV_FEATURES))
        raw_score = float(model.predict_proba(scaled)[0, 1])
        score = float(calibrated_probability(calibrator, np.asarray([raw_score], dtype=np.float32))[0])
        contributions = tree_shap(model, scaled)[0]
        if not np.isfinite(contributions).all() or not np.isfinite(score):
            raise ValueError('Non-finite inference')
        reconstructed = 1 / (1 + np.exp(-float(contributions.sum())))
        np.testing.assert_allclose(reconstructed, raw_score, atol=1e-5)
    except Exception as exc:
        logging.exception('ML inference failed')
        raise HTTPException(503, 'ML inference unavailable') from exc
    return {
        'riskScore': score,
        'riskLevel': 'HIGH' if score >= .60 else 'MODERATE' if score >= .35 else 'LOW',
        'shapValuesAsJsonString': json.dumps(dict(zip(FEATURES, map(float, contributions[:-1]))), allow_nan=False),
        'shapBaseValue': float(contributions[-1]),
        'shapOutputSpace': 'log_odds',
        'rawModelProbability': raw_score,
        'modelArtifactSha256': model_info.get('artifact_sha256'),
        'probabilityCalibration': 'sigmoid' if calibrator is not None else 'none',
    }
