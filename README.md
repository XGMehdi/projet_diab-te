# PFE ? Pr?diction du risque de diab?te

Projet compos? de `frontend` (React), `backend_v2` (Spring Boot) et `ml_api` (FastAPI/XGBoost).

La partie ML est documentee dans [ml_api/README.md](ml_api/README.md). Le [notebook execute](ml_api/training.ipynb) compare XGBoost, XGBoost + SMOTENC et trois references sur un jeu public reel UCI documente. Les [resultats mesures](ml_api/releases/uci_891_seed42/RESULTS.md) comprennent discrimination, rappel/F1 et calibration. L?API charge le meme bundle evalue, controle par SHA-256, avec vrais TreeSHAP. Les deux anciens fichiers restent conserves.

Pour le backend, copier `backend_v2/application-local.properties.example` vers `backend_v2/application-local.properties` et renseigner les identifiants locaux, ou d?finir `DB_PASSWORD`, `MAIL_USERNAME`, `MAIL_PASSWORD`, `JWT_SECRET`. Le fichier local est ignor? par Git. Lancer Maven depuis `backend_v2`. La cl? JWT doit contenir au moins 32 octets.

Les donn?es SQL de d?monstration et les exemples pr?sents dans le projet ne sont pas des r?sultats d??valuation ML.
