# co-co-co.org — site public & espace membre

Application **Next.js (App Router) + TypeScript + Tailwind CSS** du monorepo CO-CO-CO.
Voir [`docs/plan-de-developpement.md`](../../docs/plan-de-developpement.md) (§3) pour le contexte d'architecture.

## Démarrer en local

Depuis la racine du monorepo :

```bash
pnpm install
pnpm dev:web
```

L'application est servie sur [http://localhost:3000](http://localhost:3000).

**Pour que les pages de connexion/inscription fonctionnent**, `apps/api` doit tourner en local
(voir [`apps/api/README.md`](../api/README.md)) — copier `.env.example` en `.env.local` si l'API
n'écoute pas sur `http://localhost:3001`. L'API n'étant pas déployée, ces pages ne fonctionnent
pas sur la preview Vercel.

## État actuel

- Site vitrine (sprint **S1.5**) : accueil (`/`, secteurs + campagnes en vedette), page catégorie
  (`/categories/[slug]`), page détail campagne (`/campagnes/[slug]`). Données de démonstration —
  `src/lib/mock-data.ts` (aucune campagne réelle : le reste du modèle de données n'est branché sur
  l'API qu'à partir de S1.2).
- Authentification (sprint **S1.1**), branchée sur `apps/api` : inscription (`/inscription`),
  connexion (`/connexion`, email/mot de passe + Google), mot de passe oublié
  (`/mot-de-passe-oublie`, `/reinitialiser-mot-de-passe`), vérification d'email
  (`/verifier-email`). Session gérée côté client (`src/lib/auth/`) — jetons en `localStorage`
  (compromis simple pour ce sprint ; à reconsidérer avant mise en production, voir le commentaire
  dans `token-storage.ts`).

**Non encore implémenté** (sprints suivants du plan) : vote pondéré (S1.4), commentaires (S1.5),
rapports et pétitions (Phase 2), renvoi d'email de vérification, routes protégées côté client.
