# Service ML DiabeteRisk - PFA 2026

Le service ML de DiabeteRisk est une API FastAPI qui traite les 17 indicateurs du formulaire de sante. Il utilise XGBoost pour calculer un score et TreeSHAP pour expliquer la contribution de chaque indicateur.

L'entrainement compare une reference naive, une regression logistique, une foret aleatoire, XGBoost et XGBoost avec SMOTENC. La validation, la calibration et le test utilisent des partitions distinctes du jeu public CDC Diabetes Health Indicators.

Le modele charge par l'API est le meme bundle que celui evalue : il contient le modele, le scaler et le calibrateur. Les empreintes SHA-256 relient cet artefact aux resultats mesures. Les anciens fichiers de modeles sont conserves.

Les contributions SHAP expliquent la sortie brute de XGBoost ; le score retourne a l'utilisateur applique ensuite la calibration. La cible du jeu public regroupe le prediabete et le diabete declares et ne mesure pas une incidence future.

La demarche detaillee est conservee dans [METHODOLOGIE.md](METHODOLOGIE.md). Les [resultats comparatifs](releases/uci_891_seed42/RESULTS.md) et le [notebook execute](training.ipynb) documentent l'experience.
