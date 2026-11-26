# Noces

Invitation de mariage, avec un compte par utilisateur.

- `frontend` : le site Next.js
- `backend` : l'API qui enregistre chaque mariage dans MongoDB

## Démarrage

MongoDB doit tourner en local, ou bien remplacez `MONGODB_URI` dans `backend/.env` par une adresse MongoDB Atlas.

```bash
npm install --prefix backend
npm install --prefix frontend
npm run dev --prefix backend
npm run dev --prefix frontend
```

- Site de démonstration : http://localhost:3000
- Création d'une invitation : http://localhost:3000/commencer
- API : http://localhost:4000

Le design se choisit au début. La fiche (couple, date, lieux, textes, programme, couleurs, lien Drive) est enregistrée pour le compte connecté. L'invitation publique est ensuite sur `/i/prenom-et-prenom`.
