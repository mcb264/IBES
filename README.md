# IBES — console personnelle

App web (Next.js + Tailwind) : 3 canaux (Musique, Esport, Vie), chacun avec briefing du jour, décharge mentale (tri URGENT / À PLANIFIER / PARKING / À OUBLIER) et bilan hebdomadaire. Un mode rouge global, activable depuis n'importe quelle page, bascule toute la console en "objectifs réduits".

Les données sont stockées uniquement dans ce navigateur (localStorage), séparément pour chaque canal. Le briefing du jour se réinitialise automatiquement à chaque nouvelle date.

## Tester en local

```bash
npm install
npm run dev
```

Ouvrir http://localhost:3000

## Déployer sur Vercel

**Option A — sans GitHub, en une commande :**

```bash
npm install -g vercel
vercel
```

Suivre les instructions (connexion à ton compte Vercel, puis `vercel --prod` pour la mise en ligne définitive).

**Option B — via GitHub :**

1. Créer un repo GitHub et y pousser ce dossier :
   ```bash
   git init
   git add .
   git commit -m "IBES"
   git branch -M main
   git remote add origin <url-de-ton-repo>
   git push -u origin main
   ```
2. Aller sur https://vercel.com/new, importer le repo.
3. Vercel détecte Next.js automatiquement — aucun réglage à changer. Cliquer sur "Deploy".

## Structure

- `app/page.tsx` — page principale, gère l'état global et les onglets
- `components/BriefingPanel.tsx` — briefing du jour
- `components/DumpPanel.tsx` — décharge mentale
- `components/ReviewPanel.tsx` — bilan hebdomadaire
- `components/ModeRougeSwitch.tsx` — bascule mode rouge
- `lib/storage.ts` — persistance localStorage
