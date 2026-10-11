# Partie ML du PFE

## État initial et conservation
Le dépôt fournit `scaler.pkl` et `xgboost_diabetes_model.pkl`, sans CSV, provenance, notebook ni métriques vérifiables. Le scaler expose 17 colonnes et a été sérialisé avec scikit-learn 1.6.1. Les deux fichiers sont conservés et ne sont jamais écrasés par l'entraînement. L'API charge ces artefacts depuis son propre répertoire, indépendamment du dossier de lancement.

Aucune performance expérimentale n'est annoncée tant que le notebook n'a pas été exécuté sur des données réelles. Les essais sur données synthétiques sont exclusivement des tests logiciels et ne constituent pas une évaluation du PFE.

## Installation et exécution (Python 3.12)
Depuis la racine du projet, PowerShell :

```powershell
python -m venv ml_api/.venv
ml_api/.venv/Scripts/python.exe -m pip install -r ml_api/requirements-lock.txt
ml_api/.venv/Scripts/python.exe -m ipykernel install --user --name pfe-ml
ml_api/.venv/Scripts/python.exe -m uvicorn ml_api.main:app --reload
```
Ouvrir `training.ipynb` avec le kernel pfe-ml dans VS Code/Jupyter. Déposer le CSV localement dans `ml_api/data/diabetes_binary.csv` ou définir `ML_DATA_PATH`. `ML_RUN_DIR` définit un nouveau dossier de résultats, et `ML_TARGET` une colonne cible explicitement binaire (défaut `Diabetes_binary`). Aucun téléchargement automatique ni transformation implicite d'une cible à trois classes.

Alternative sans notebook :
```powershell
ml_api/.venv/Scripts/python.exe ml_api/training.py --csv chemin/donnees.csv --output ml_api/runs/experience_001 --target Diabetes_binary
ml_api/.venv/Scripts/python.exe -m unittest discover -s ml_api/tests -v
```

## Contrat des données
Ordre strict du CSV : HighBP, HighChol, CholCheck, BMI, Smoker, Stroke, HeartDiseaseorAttack, PhysActivity, Fruits, Veggies, HvyAlcoholConsump, GenHlth, MentHlth, PhysHlth, DiffWalk, Sex, Age. Les colonnes supplémentaires sont ignorées. BMI positif ; GenHlth entier 1–5 ; MentHlth/PhysHlth entiers 0–30 ; Age catégorie entière 1–13 (18–24, 25–29, …, 75–79, 80+) ; Sex 0 femme/1 homme ; autres variables 0/1. L'API reçoit les noms camelCase et MALE/FEMALE. La cible doit contenir les deux classes 0 et 1 ; sa définition doit être consignée. Ne pas assimiler silencieusement prédiabète et diabète.

Le nom des colonnes correspond au schéma des indicateurs BRFSS, mais il ne prouve ni l'origine exacte ni la définition de la cible des anciens artefacts. Avant le mémoire, consigner source et licence, année, population, échantillonnage, définition du label et prévalence. Aucun CSV réel n'est inclus ici.

## Démarche expérimentale
Retrait des doublons exacts. Groupement des vecteurs de caractéristiques identiques, y compris si leurs labels diffèrent, pour éviter leur présence dans entraînement et test. Partition StratifiedGroupKFold en cinq plis, premier pli réservé au test (environ 20 %, répartition approchée par groupes). Validation croisée groupée à cinq plis sur le reste, mêmes partitions pour tous les modèles. Le scaler fait partie de chaque pipeline, ajusté uniquement sur l'entraînement de chaque pli. Aucun suréchantillonnage avant la partition.

Comparaison : DummyClassifier (prévalence), régression logistique, RandomForest, XGBoost. Hyperparamètres fixes explicités dans `training.py`, sans recherche optimisée pour l'un des modèles. Seed 42 (43 pour les plis internes), CPU, un thread pour les estimateurs. Sélection par average precision moyenne de validation avant consultation du test. Seuil 0,5 pour les métriques de classification. Ne pas changer ce choix après examen du test ; tout réglage supplémentaire doit utiliser uniquement entraînement/validation.

Exports : scores de chaque pli et moyenne/écart-type, ROC-AUC, average precision (ce n'est pas une aire PR calculée par trapèzes), accuracy, balanced accuracy, précision, rappel, F1, Brier, log-loss, rapports par classe, matrices de confusion, courbes ROC/PR et calibration. Le manifeste contient empreinte SHA-256 du CSV, indices après dédoublonnage, paramètres et versions ; `environment.txt` fige aussi les dépendances transitives de l'exécution. Un dossier existant est refusé pour préserver les expériences. Les modèles entraînés restent dans `runs/` ; aucun déploiement automatique.

Les artefacts historiques ne sont pas inclus dans le classement : sans connaître leurs données d'entraînement, leur évaluation sur le CSV pourrait être contaminée. Les seuils applicatifs 0,35/0,60 sont conservés pour compatibilité, sans validation clinique revendiquée. L'écart-type des plis n'est pas un intervalle de confiance. Aucune étude externe, temporelle ou clinique n'est disponible. Un CSV équilibré artificiellement ne permet pas d'interpréter directement les probabilités comme risque populationnel.

## SHAP et API
Les 17 valeurs simulées sont remplacées par TreeSHAP natif exact de XGBoost (`pred_contribs=True`, `approx_contribs=False`). Calcul sur les mêmes données standardisées et mêmes arbres que la prédiction ; vérification que base + contributions = marge et que sa sigmoïde = probabilité. Valeurs signées en log-odds, pas en points de pourcentage et sans interprétation causale. Le JSON existant contient les 17 contributions ; `shapBaseValue` et `shapOutputSpace` sont des champs additionnels. La base n'est pas une caractéristique. Le notebook exporte aussi l'importance moyenne absolue sur au plus 500 observations test.

L'API renvoie 503 si chargement, prédiction ou explication échoue, et 422 pour une entrée invalide. Le backend Spring Boot transmet l'indisponibilité avec 503 avant toute sauvegarde, sans score ou SHAP fictifs. Le frontend existant ne présente pas encore la base ni l'unité SHAP ; ses graphiques ne doivent pas être lus comme des pourcentages de risque.

Références : [API XGBoost, contributions SHAP](https://xgboost.readthedocs.io/en/release_2.1.0/python/python_api.html), [évaluation scikit-learn](https://scikit-learn.org/stable/modules/model_evaluation.html).

L?environnement complet test? est fix? dans `requirements-lock.txt` ; `requirements.txt` liste les d?pendances directes. XGBoost signale que le pickle historique provient d?une ancienne s?rialisation : le chargement et l?additivit? SHAP sont v?rifi?s ici, mais la version d?origine reste inconnue. Les artefacts sont conserv?s sans conversion.
