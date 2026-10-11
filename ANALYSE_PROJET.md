# Analyse du projet

Architecture : frontend React 19 / TypeScript / Vite, backend Java 17 / Spring Boot 4.0.6 / PostgreSQL, API Python FastAPI avec modèle XGBoost. Le dossier modules contient des maquettes HTML.

Fonctionnalités : authentification JWT, réinitialisation du mot de passe, profil, prédictions, historique, export PDF, tableaux de bord et administration.

Flux : React (3000) → Spring Boot (8080) → PostgreSQL et FastAPI (8000).

Points prioritaires :
- Le backend utilise un score simulé de 0,73 si FastAPI échoue ; Python renvoie 0,85 si le modèle ne charge pas.
- Les valeurs SHAP Python sont simulées.
- Clé JWT codée en dur, compte administrateur avec mot de passe faible et identifiants PostgreSQL/SMTP dans la configuration : à externaliser avant publication.
- URL des services codées en dur.
- Manifeste de dépendances Python absent ; chargement des modèles dépendant du répertoire courant.

Analyse statique uniquement : application non compilée et non exécutée. Java non détecté dans le PATH, dépendances frontend non installées.

Dépôt demandé : https://github.com/XGMehdi/projet_diab-te.git
La connexion réseau à GitHub a échoué. Son existence, ses permissions et son historique restent à vérifier. Aucun push effectué. Quand le réseau sera disponible, effectuer git fetch origin et examiner les branches avant synchronisation.
