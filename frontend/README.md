# Interface DiabeteRisk - PFA 2026

Le frontend est l'interface web du projet DiabeteRisk, realise avec React et TypeScript.

Il propose les pages de connexion et d'inscription, la gestion du profil, un formulaire de prediction, un tableau de bord et un historique des analyses. L'espace administrateur donne acces aux utilisateurs, aux predictions et aux statistiques.

L'interface communique avec le backend Spring Boot. Elle affiche le score retourne par le service ML et les contributions SHAP signees en log-odds, qui expliquent le score brut avant calibration.
