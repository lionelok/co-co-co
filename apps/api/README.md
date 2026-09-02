# API — co-co-co.org & admin.co-co-co.org

API REST commune du monorepo CO-CO-CO — **NestJS + TypeScript**, **PostgreSQL** via **Prisma**.
Voir [`docs/plan-de-developpement.md`](../../docs/plan-de-developpement.md) (§3) pour le contexte d'architecture.

## État actuel — sprint S1.1 (authentification)

- `POST /auth/register`, `POST /auth/login`, `POST /auth/refresh`, `POST /auth/logout`
- `GET /auth/verify-email?token=…`
- `POST /auth/forgot-password`, `POST /auth/reset-password` (réinitialise le mot de passe et
  révoque toutes les sessions actives du membre)
- `GET /auth/google`, `GET /auth/google/callback` (connexion Google — désactivées tant que
  `GOOGLE_CLIENT_ID`/`GOOGLE_CLIENT_SECRET` ne sont pas renseignés)
- `GET /members/me` (profil du membre authentifié)
- `GET /health`

Sessions **JWT (access token court) + refresh token opaque avec rotation**, conformément au §3 du
plan de développement. Le refresh token n'est jamais stocké en clair (seul son hash SHA-256 l'est).

**Rate limiting** : `/auth/register`, `/auth/login`, `/auth/forgot-password` et
`/auth/reset-password` sont protégés par un limiteur en mémoire (`src/common/rate-limit.guard.ts`,
par IP + route). Volontairement simple — ne fonctionne pas correctement à plusieurs instances ; la
version partagée (Redis) est prévue en S1.4 pour le vote, cf. §3 du plan.

**Non couvert par ce sprint** : envoi d'emails réel (le fournisseur — Postmark/SES — reste à
choisir en Phase 0 ; `EmailService` se contente de logger pour l'instant), renvoi d'email de
vérification, rôles internes autres qu'auth de base (pas de guard par rôle), journal d'audit
(`AuditLog`), toute autre entité du modèle de données (Sector, Campaign, Vote…, prévues à partir de
S1.2).

## Démarrer en local

```bash
docker compose -f ../../infra/docker-compose.yml up -d   # PostgreSQL local
cp .env.example .env                                       # puis ajuster si besoin
pnpm install                                                # depuis la racine du monorepo
pnpm --filter @co-co-co/api prisma:migrate                 # crée le schéma en base
pnpm dev:api                                                 # sur http://localhost:3001
```

## Tests

```bash
pnpm --filter @co-co-co/api test       # unitaires (vitest) — sans base de données
pnpm --filter @co-co-co/api test:e2e   # e2e — nécessite la base PostgreSQL locale
```
