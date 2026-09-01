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

## État actuel

Ce qui suit le sprint **S1.5** du plan de développement (site vitrine) :

- Page d'accueil (`/`) : secteurs, campagnes en vedette.
- Page catégorie (`/categories/[slug]`) : liste des campagnes d'une catégorie.
- Page détail campagne (`/campagnes/[slug]`) : fiche, critères, note pondérée.

Les données affichées proviennent pour l'instant de `src/lib/mock-data.ts` (aucune
API/backend n'est encore branché — cf. `apps/api`, non initialisé). Le modèle de
données correspond aux types partagés dans `@co-co-co/types`.

**Non encore implémenté** (sprints suivants du plan) : authentification et espace
membre (S1.1), vote pondéré (S1.4), commentaires (S1.5), rapports et pétitions
(Phase 2).
