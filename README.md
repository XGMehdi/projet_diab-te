# PFE ? Pr?diction du risque de diab?te

Projet compos? de `frontend` (React), `backend_v2` (Spring Boot) et `ml_api` (FastAPI/XGBoost).

La d?marche ML, les commandes et les limites sont d?crites dans [ml_api/README.md](ml_api/README.md). Le notebook [training.ipynb](ml_api/training.ipynb) compare XGBoost et trois r?f?rences, avec ?valuation et vrais calculs TreeSHAP. Les mod?les historiques sont conserv?s. Aucun r?sultat de performance n?est revendiqu? sans ex?cution sur un CSV r?el document?. Aucun SMOTE n?a ?t? supprim? ; le protocole ajout? n?en utilise pas actuellement.

Pour le backend, copier `backend_v2/application-local.properties.example` vers `backend_v2/application-local.properties` et renseigner les identifiants locaux, ou d?finir `DB_PASSWORD`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `JWT_SECRET`. Le fichier local est ignor? par Git. Lancer Maven depuis `backend_v2`. La cl? JWT doit contenir au moins 32 octets.

Les donn?es SQL de d?monstration et les exemples pr?sents dans le projet ne sont pas des r?sultats d??valuation ML.
