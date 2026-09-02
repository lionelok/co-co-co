# CO-CO-CO

Plateforme digitale d'évaluation citoyenne pour la communauté congolaise (RDC et diaspora) : campagnes d'évaluation, votes pondérés, commentaires, rapports et pétitions.

- Site public + espace membre : `co-co-co.org` ([`apps/web`](apps/web))
- Back-office d'administration : `admin.co-co-co.org` ([`apps/admin`](apps/admin), non initialisé)
- API : [`apps/api`](apps/api) — authentification initialisée (sprint S1.1)

## Documentation

- [Plan de développement](docs/plan-de-developpement.md) — méthodologie, architecture technique, phasage en sprints, risques et jalons.

## Démarrer en local

```bash
pnpm install
pnpm dev:web        # co-co-co.org sur http://localhost:3000

# apps/api nécessite une base PostgreSQL locale — voir apps/api/README.md
docker compose -f infra/docker-compose.yml up -d
pnpm --filter @co-co-co/api prisma:migrate
pnpm dev:api        # API sur http://localhost:3001
```

Autres commandes utiles à la racine : `pnpm build`, `pnpm lint`, `pnpm typecheck`, `pnpm test`,
`pnpm format:check` (exécutées en CI, voir [`.github/workflows/ci.yml`](.github/workflows/ci.yml)).

## Structure du dépôt

Monorepo pnpm, conforme au §3 du plan de développement :

```
co-co-co/
├── apps/
│   ├── web/     # co-co-co.org — site public + espace membre (Next.js) — initialisé
│   ├── admin/   # admin.co-co-co.org — back-office (React) — à initialiser
│   └── api/     # API REST commune (NestJS + PostgreSQL/Prisma) — authentification (S1.1)
├── packages/
│   ├── ui/      # composants partagés
│   ├── types/   # types/DTO partagés entre apps
│   └── config/  # config partagée (tsconfig, ESLint)
├── infra/       # docker-compose (PostgreSQL local) ; IaC/déploiement production à initialiser
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

- **`apps/web`** (co-co-co.org) : squelette Next.js/TypeScript/Tailwind — accueil, pages catégorie
  et campagne (sprint S1.5 « site vitrine »), sur données de démonstration. Voir
  [`apps/web/README.md`](apps/web/README.md).
- **`apps/api`** : authentification (sprint S1.1) — inscription + confirmation email, connexion
  email/mot de passe, connexion Google (OAuth2), sessions JWT + refresh token. Voir
  [`apps/api/README.md`](apps/api/README.md).

Le back-office (`apps/admin`), le reste du modèle de données (campagnes, votes, commentaires…) et
l'infrastructure de production restent à initialiser (voir le phasage du plan de développement,
§5 et §8).
