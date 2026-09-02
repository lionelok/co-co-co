# infra

Infrastructure-as-code et scripts de déploiement de production — non initialisés.
Le choix d'hébergeur et de pays d'hébergement des données fait partie des
décisions à arbitrer en Phase 0 (voir [plan de développement](../docs/plan-de-developpement.md), §9.5).

`docker-compose.yml` : PostgreSQL local pour développer `apps/api` (pas un
outil de déploiement — usage dev uniquement) :

```bash
docker compose -f infra/docker-compose.yml up -d
```
