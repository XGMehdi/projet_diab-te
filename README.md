# DiabeteRisk - PFA 2026

DiabeteRisk est une application web realisee dans le cadre du Projet de Fin d'Annee (PFA) 2026. Elle permet de saisir des informations de sante, d'obtenir un score estime par un modele de machine learning et de consulter les facteurs qui influencent ce score.

Le parcours utilisateur comprend la creation de compte, la connexion, la gestion du profil, un formulaire de prediction, un tableau de bord et un historique des analyses. Un espace administrateur permet de consulter les utilisateurs, les predictions et les statistiques de l'application.

Le projet repose sur trois parties :

- **frontend** : interface React et TypeScript pour les utilisateurs et les administrateurs.
- **backend_v2** : API Spring Boot qui gere les comptes, l'authentification JWT et les donnees stockees dans PostgreSQL.
- **ml_api** : API FastAPI qui calcule les scores avec XGBoost et explique les predictions avec SHAP.

Le formulaire utilise 17 indicateurs de sante et de mode de vie, dont la tension arterielle, le cholesterol, le BMI, l'activite physique et la categorie d'age. L'interface transmet ces informations au backend, qui interroge le service ML puis enregistre le resultat dans l'historique.

La partie ML compare XGBoost a des modeles de reference et inclut une variante avec SMOTENC pour le traitement du desequilibre des classes. L'API utilise le modele evalue avec son scaler et son calibrateur. Les contributions SHAP expliquent le score brut du modele.

L'experience publique utilise CDC Diabetes Health Indicators : sa cible regroupe le prediabete et le diabete declares. Le score obtenu ne constitue pas un diagnostic medical ni une estimation validee du risque futur.
