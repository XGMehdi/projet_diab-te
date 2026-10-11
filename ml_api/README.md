# ML : experience executee et modele servi

Le notebook `training.ipynb` execute une comparaison reelle sur le jeu public **CDC Diabetes Health Indicators**, UCI 891. Le rapport mesure est dans `releases/uci_891_seed42/RESULTS.md`, les metriques brutes dans `test_metrics.csv`, la calibration par intervalle dans les CSV `*_calibration_bins.csv` et les courbes dans `evaluation.png`.

## Donnees documentees
Source officielle : https://archive.ics.uci.edu/dataset/891/cdc+diabetes+health+indicators
Telechargement : https://archive.ics.uci.edu/static/public/891/data.csv
253 680 reponses, 21 variables originales, cible **Diabetes_binary : 0 sans diabete, 1 prediabete ou diabete**. Le projet utilise les 17 variables de son formulaire ; ID, AnyHealthcare, NoDocbcCost, Education et Income ne sont pas des predicteurs de cette experience. L?empreinte du CSV, la date de recuperation et les notes de provenance sont dans `dataset_provenance.json`.

Ce CSV public est utilise pour la nouvelle experience ; aucune preuve ne permet d?affirmer qu?il correspond aux donnees ayant produit les anciens fichiers. La page UCI renvoie au jeu derive BRFSS2015 sur Kaggle mais ses metadonnees citent aussi annual_2014 : cette incoherence de source est consign?e, sans inventer une verification de l?annee originale. UCI renvoie a la licence du jeu lie ; le CSV brut n?est pas republie. Il est telecharge dans `data/`, ignore par Git.

## Protocole fixe avant execution
Doublons exacts retires sur les 17 predicteurs et la cible. Les vecteurs identiques restent groupes, meme avec labels contradictoires, dans toutes les partitions. StratifiedGroupKFold (5 plis, seed 42) : pli 0 pour test, pli 1 pour calibration, autres pour entrainement, soit environ 20/20/60 %. Validation croisee groupee a cinq plis (seed 43) sur l?entrainement uniquement. Les tailles et proportions effectives sont dans le manifeste. Le regroupement rend la stratification approchee.

References : DummyClassifier (prior), regression logistique, RandomForest (100 arbres, profondeur 12), XGBoost (200 arbres, profondeur 3), XGBoost + **SMOTENC**, variante SMOTE pour donnees mixtes. Les parametres complets sont dans le manifeste et `training.py`. Scaler ajuste uniquement dans chaque pli ; SMOTENC intervient pendant fit uniquement. Les variables binaires, GenHlth et Age sont traitees comme categories ; BMI, MentHlth et PhysHlth comme numeriques. Les donnees synthetiques ne traversent jamais vers calibration ou test. Le benchmark contient les variantes avec et sans sur?chantillonnage, sans supprimer SHAP ni les fichiers historiques.

Selection par average precision moyenne des plis d?entrainement, avant les scores de test. Le meilleur modele toutes familles et la meilleure variante **dans la famille XGBoost** sont rapportes separement. L?API utilise cette derniere pour conserver le contrat TreeSHAP ; elle n?est pas presentee comme meilleure toutes familles si elle ne l?est pas.

Chaque modele est ajuste sur l?entrainement, puis une sigmoide (regression logistique sur le logit de sa probabilite brute, clip 1e-7) est ajustee exclusivement sur calibration. Le test compare sorties brutes et calibrees : ROC-AUC, average precision, rappel, F1, precision, accuracy, balanced accuracy, Brier, log-loss et ECE (10 intervalles de meme largeur). Les effectifs et frequences de chaque intervalle sont exportes. ECE depend du choix des intervalles ; aucune calibration parfaite n?est revendiquee. Seuil 0,5 pour rappel/F1, distinct des seuils applicatifs 0,35/0,60 conserves pour compatibilite.

## Artefact evalue = artefact API
`api_bundle.joblib` contient **modele XGBoost + scaler + calibrateur + contrat + metriques**. Il est recharge a la fin de l?experience et toutes ses probabilites test sont comparees aux predictions exportees (tolerance absolue 1e-12). `activate_release.py` verifie son SHA-256, copie le fichier exact vers `releases/`, puis ecrit `active_artifact.json`. L?API charge ce bundle, verifie empreinte et schema, et expose `/model-info` : identite de l?artefact, empreinte du CSV et evaluation correspondante. Une configuration invalide renvoie 503 ; elle ne bascule pas silencieusement vers un ancien modele.

Les fichiers historiques `scaler.pkl` et `xgboost_diabetes_model.pkl` sont conserves, inchanges. En l?absence de `active_artifact.json`, l?API les charge et indique explicitement `legacy_unverified` : aucune metrique du nouveau modele ne leur est attribuee. Pour revenir a ce mode, deplacer la configuration active hors de son emplacement, puis redemarrer l?API. Les nouveaux entrainements n?ecrasent jamais les deux fichiers.

## SHAP reels et calibration
TreeSHAP exact natif XGBoost, meme scaler et memes arbres que la prediction. Base + contributions reconstruit la marge brute ; sa sigmoide donne **rawModelProbability**. La sigmoide de calibration appliquee ensuite produit **riskScore**. Les SHAP sont en log-odds **du modele brut**, pas en pourcentage ni en contributions additives a la probabilite calibree. L?API fournit aussi `shapBaseValue`, `shapOutputSpace`, `probabilityCalibration` et `modelArtifactSha256`. Les 17 contributions restent dans le JSON attendu par Spring Boot. Le graphique global utilise au plus 500 lignes de test. Aucun SHAP simule ni resultat de secours fixe n?est utilise a la prediction.

## Reproduire
Python 3.12, depuis la racine, PowerShell :

```powershell
python -m venv ml_api/.venv
ml_api/.venv/Scripts/python.exe -m pip install -r ml_api/requirements-lock.txt
ml_api/.venv/Scripts/python.exe ml_api/fetch_data.py
$env:ML_RUN_DIR = (Join-Path (Get-Location) 'ml_api/runs/uci_891_reproduction')
ml_api/.venv/Scripts/python.exe ml_api/execute_notebook.py
ml_api/.venv/Scripts/python.exe ml_api/activate_release.py --run ml_api/runs/uci_891_reproduction --release uci_891_reproduction
ml_api/.venv/Scripts/python.exe -m uvicorn ml_api.main:app --reload
```

Le dossier de sortie et le nom de release doivent etre nouveaux ; leur ecrasement est refuse. `ML_DATA_PATH`, `ML_TARGET`, `ML_PROVENANCE_PATH` permettent d?utiliser un autre CSV avec provenance explicite. Pour une execution interactive, choisir le kernel Python de `.venv` dans VS Code/Jupyter. Alternative CLI :

```powershell
ml_api/.venv/Scripts/python.exe ml_api/training.py --csv ml_api/data/uci_891.csv --provenance ml_api/data/uci_891_provenance.json --output ml_api/runs/nouvelle_experience
ml_api/.venv/Scripts/python.exe -m unittest discover -s ml_api/tests -v
```

## Limites
Le jeu contient un etat declare existant, pas un suivi longitudinal : ces scores ne mesurent pas le risque futur d?apparition du diabete. Evaluation interne a une enquete americaine, sans validation clinique ou validation externe au Maroc, sans ponderation du plan d?enquete. Les doublons retires changent la population effective et sa prevalence ; celle-ci est rapportee. Le test ne sert pas au reglage des seuils, hyperparametres ou choix du modele. Les anciennes performances et leur provenance restent inconnues. Les tests synthetiques verifient le logiciel uniquement. Les donnees SQL de demonstration du backend ne sont pas des resultats de cette experience.

References techniques : https://xgboost.readthedocs.io/en/release_2.1.0/python/python_api.html ; https://imbalanced-learn.org/stable/references/generated/imblearn.over_sampling.SMOTENC.html ; https://imbalanced-learn.org/stable/references/generated/imblearn.pipeline.Pipeline.html

Le SHA-256 du bundle porte sur ses octets ; le manifeste est controle par une empreinte JSON canonique pour rester valide lorsque Git change les fins de ligne entre Windows et Linux. `api_verification.json` consigne les probabilites et metriques test verifiees, puis les controles de 100 appels HTTP. Le frontend affiche les SHAP signes en log-odds au lieu de pourcentages.

Verification du modele servi :
```powershell
ml_api/.venv/Scripts/python.exe ml_api/verify_release.py --csv ml_api/data/uci_891.csv --release ml_api/releases/uci_891_seed42
```
Le rapport de verification contient les 37 705 probabilites test et metriques controlees, ainsi que 100 requetes HTTP et verifications SHAP. Apres mise a jour de la configuration active, redemarrer une API deja lancee pour charger ce bundle. Les pipelines des autres familles restent dans le dossier local runs ; leur reentrainement est reproductible via le notebook.
