# CO-CO-CO

Plateforme digitale d'évaluation citoyenne pour la communauté congolaise (RDC et diaspora) : campagnes d'évaluation, votes pondérés, commentaires, rapports et pétitions.

- Site public + espace membre : `co-co-co.org` ([`apps/web`](apps/web))
- Back-office d'administration : `admin.co-co-co.org` ([`apps/admin`](apps/admin), non initialisé)
- API : [`apps/api`](apps/api) (non initialisée)

## Documentation

- [Plan de développement](docs/plan-de-developpement.md) — méthodologie, architecture technique, phasage en sprints, risques et jalons.

## Démarrer en local

```bash
pnpm install
pnpm dev:web        # co-co-co.org sur http://localhost:3000
```

Autres commandes utiles à la racine : `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm format:check`
(exécutées en CI, voir [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Structure du dépôt

Monorepo pnpm, conforme au §3 du plan de développement :

```
co-co-co/
├── apps/
│   ├── web/     # co-co-co.org — site public + espace membre (Next.js) — initialisé
│   ├── admin/   # admin.co-co-co.org — back-office (React) — à initialiser
│   └── api/     # API REST commune (NestJS) — à initialiser
├── packages/
│   ├── ui/      # composants partagés
│   ├── types/   # types/DTO partagés entre apps
│   └── config/  # config partagée (tsconfig, ESLint)
├── infra/       # Docker, IaC, scripts de déploiement — à initialiser
└── docs/        # cahier des charges, ADRs, plan de recette, plan de développement
```

## Déploiement de preview (Vercel)

`apps/web` est prêt pour un déploiement de preview automatique sur les pull requests via
l'intégration GitHub officielle de Vercel (`apps/web/vercel.json` configure le framework et un
`ignoreCommand` qui saute le build si la PR ne touche ni `apps/web`, ni `packages/`, ni le
lockfile). Cette connexion nécessite un compte Vercel et ne peut pas être faite par Claude —
à faire une fois, manuellement :

1. Sur [vercel.com/new](https://vercel.com/new), importer le dépôt GitHub `lionelok/co-co-co`
   (installe l'intégration GitHub de Vercel, qui commentera automatiquement chaque PR avec son
   URL de preview).
2. **Root Directory** : `apps/web` (Vercel détecte alors seul le monorepo pnpm et lance
   `pnpm install` depuis la racine).
3. **Framework Preset** : Next.js (auto-détecté).
4. Déployer. Les prochains push sur `claude/cocococo-site-dev-kncxr1` (et toute future PR)
   généreront automatiquement une preview.

Il ne s'agit que d'un environnement de preview pour la revue de code — le choix de l'hébergeur de
production reste une décision d'Annexe B à arbitrer en Phase 0 (plan de développement, §9.5).

## État d'avancement

Le développement a démarré côté **`apps/web`** (co-co-co.org) : squelette Next.js/TypeScript/Tailwind
avec page d'accueil, pages catégorie et campagne (sprint S1.5 « site vitrine »), sur données de
démonstration. Voir [`apps/web/README.md`](apps/web/README.md) pour le détail. Le back-office, l'API
et l'infrastructure restent à initialiser (voir le phasage du plan de développement, §5 et §8).
