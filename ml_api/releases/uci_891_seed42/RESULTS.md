# Measured results

## Data and interpretation

Reference dataset: [CDC Diabetes Health Indicators, UCI 891](https://archive.ics.uci.edu/dataset/891/cdc+diabetes+health+indicators).
Target: 0 = no diabetes; 1 = prediabetes or diabetes. This public reference experiment does not establish the training provenance of the historical artifacts.
Raw rows: 253680. Retained rows: 188455. Exact duplicate rows removed on the 17 predictors plus target: 65225. These scores concern the deduplicated population, not the full raw survey population.

Rows: train / calibration / test: (113094, 37656, 37705)
CSV SHA-256: `9f71fda9d4ae5f4878c99b9233b6a16accfa9a17c194116a6b78100540934964`

Selected across all models using training CV: xgboost
API XGBoost variant selected using training CV: xgboost

Threshold 0.5. Calibration uses a separate partition. ECE uses 10 equal-width bins.

| Model | Calibration | ROC-AUC | AP | Recall | F1 | Brier | Log-loss | ECE |
|---|---|---:|---:|---:|---:|---:|---:|---:|
| dummy | raw | 0.500000 | 0.174566 | 0.000000 | 0.000000 | 0.144109 | 0.463108 | 0.004020 |
| dummy | sigmoid | 0.500000 | 0.174566 | 0.000000 | 0.000000 | 0.144094 | 0.463057 | 0.001169 |
| logistic_regression | raw | 0.789943 | 0.409094 | 0.147979 | 0.230943 | 0.121905 | 0.383632 | 0.011508 |
| logistic_regression | sigmoid | 0.789943 | 0.409094 | 0.144789 | 0.227067 | 0.121898 | 0.383604 | 0.011995 |
| random_forest | raw | 0.799938 | 0.437284 | 0.123215 | 0.202623 | 0.119344 | 0.375583 | 0.010315 |
| random_forest | sigmoid | 0.799938 | 0.437284 | 0.161501 | 0.250501 | 0.119276 | 0.374719 | 0.004198 |
| xgboost | raw | 0.802639 | 0.443217 | 0.157703 | 0.247555 | 0.118631 | 0.373318 | 0.007386 |
| xgboost | sigmoid | 0.802639 | 0.443217 | 0.166667 | 0.257542 | 0.118637 | 0.373106 | 0.005922 |
| xgboost_smotenc | raw | 0.795034 | 0.429265 | 0.655120 | 0.473404 | 0.160518 | 0.477280 | 0.175710 |
| xgboost_smotenc | sigmoid | 0.795034 | 0.429265 | 0.145852 | 0.230880 | 0.120171 | 0.378014 | 0.004882 |

API artifact SHA-256: `5f55d74b4315933ae3fb72c00b969b0234875f9de519794d4c06985fcbfce3f1`
The saved API bundle reproduces every exported test probability (absolute tolerance 1e-12).
Raw SHAP explains the raw model margin; sigmoid calibration is a separate transformation.
Historical models have unknown provenance and are not scored as if independently tested.

The selected XGBoost recall is 0.166667 at threshold 0.5; selection optimized validation average precision, not sensitivity at this threshold. No clinical sensitivity or future-incidence claim is made.
Sigmoid calibration improves XGBoost ECE (0.007386 to 0.005922) and log-loss (0.373318 to 0.373106), but slightly worsens Brier (0.118631 to 0.118637). Calibration is not claimed to improve every metric.
SMOTENC raw recall is 0.655120, but raw ECE is 0.175710 and Brier is 0.160518. After sigmoid calibration, recall at the same 0.5 threshold is 0.145852.
Cross-validation ranks are mean-score comparisons, not statistical significance claims. All trained benchmark pipelines remain in the local run; the exact evaluated API bundle and its verification are included in this release.
