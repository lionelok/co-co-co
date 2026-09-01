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

## État d'avancement

Le développement a démarré côté **`apps/web`** (co-co-co.org) : squelette Next.js/TypeScript/Tailwind
avec page d'accueil, pages catégorie et campagne (sprint S1.5 « site vitrine »), sur données de
démonstration. Voir [`apps/web/README.md`](apps/web/README.md) pour le détail. Le back-office, l'API
et l'infrastructure restent à initialiser (voir le phasage du plan de développement, §5 et §8).
