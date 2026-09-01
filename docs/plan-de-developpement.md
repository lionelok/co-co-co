# Plan de développement — Projet CO-CO-CO

**Basé sur :** Cahier des charges v1.0 (1er septembre 2026)
**Objet :** Proposer une trajectoire de réalisation (méthode, équipe, architecture technique, phasage détaillé en sprints, risques, jalons de recette) pour livrer la plateforme décrite dans le cahier des charges.
**Statut :** Proposition de travail — à valider avec le commanditaire, notamment les points listés en §9 (Annexe B du cahier des charges).

---

## 1. Méthodologie

- **Agile / Scrum**, sprints de 2 semaines, avec un backlog unique priorisé par le Product Owner.
- Cérémonies : sprint planning, daily standup (15 min), sprint review/démo en fin de sprint, rétrospective.
- Outils : backlog et suivi dans GitHub Projects/Issues (ce dépôt), CI/CD via GitHub Actions.
- Chaque sprint livre un incrément **démontrable** sur un environnement de *staging*, testable par le Product Owner avant mise en production.
- Les décisions ouvertes de l'Annexe B du cahier des charges sont arbitrées **avant ou pendant la Phase 0** — elles conditionnent plusieurs choix techniques (ex. règles de modération, granularité des rôles).

## 2. Équipe cible

| Rôle | Implication | Responsabilité |
|---|---|---|
| Product Owner (commanditaire) | Continue | Vision produit, priorisation, validation des livrables |
| Chef de projet / Scrum Master | Continue | Pilotage des sprints, coordination, reporting |
| Designer UX/UI | Forte en Phase 0, ponctuelle ensuite | Wireframes, maquettes haute-fidélité, identité visuelle (§11 CDC) |
| Développeur·se backend (×1–2) | Continue | API, modèle de données, sécurité, intégrations |
| Développeur·se frontend (×1–2) | Continue | Site public + espace membre, back-office |
| QA / Testeur·se | À partir de la Phase 1 | Plan de recette, tests de non-régression, tests de charge |
| DevOps (temps partiel) | Phase 0 puis continu | CI/CD, hébergement, monitoring, sauvegardes |
| Conseil juridique (ponctuel) | Phase 0, puis à la demande | CGU, politique de confidentialité, charte de modération, droit de réponse |
| Équipe de modération (à recruter) | À partir de la mise en production | Traitement des signalements, modération des commentaires |

## 3. Architecture technique proposée

Reprend et précise la proposition indicative du cahier des charges (§9), à confirmer en Phase 0.

| Composant | Choix proposé | Justification |
|---|---|---|
| Frontend site + espace membre | **Next.js (React) + TypeScript**, Tailwind CSS | SEO et performance (SSR/SSG) nécessaires pour un site vitrine à vocation virale ; mobile-first natif |
| Frontend back-office | **React (Vite) + TypeScript**, bibliothèque de composants admin | Application distincte, plus rapide à développer, pas de contrainte SEO |
| Backend / API | **NestJS (Node.js/TypeScript)**, API REST modulaire par domaine (campagnes, votes, membres, pétitions, modération) | Structure modulaire alignée sur le modèle de données, écosystème riche (auth, validation, tâches planifiées) |
| Base de données | **PostgreSQL** + **Prisma** (ORM/migrations) | Intégrité relationnelle indispensable (votes uniques, pondérations, historisation) |
| Authentification | Sessions **JWT + refresh token**, **OAuth2 Google** | Conforme §5.3 du CDC ; extensible à d'autres fournisseurs plus tard |
| Cache / anti-fraude | **Redis** (rate limiting, sessions, verrous de vote), **captcha (Cloudflare Turnstile ou hCaptcha)** | Réponse directe aux exigences anti-fraude (§5.2.3, §8.1) |
| Tâches asynchrones | File de jobs (BullMQ sur Redis) | Envoi d'emails, génération de rapports PDF, calculs de notes à la clôture |
| Emails transactionnels | Fournisseur dédié (ex. Postmark, Amazon SES) | Confirmation d'inscription, vérification de vote/pétition, notifications de suivi |
| Stockage fichiers | Stockage objet compatible S3 + CDN | Visuels de campagnes, rapports PDF, avatars |
| Hébergement | Cloud avec CDN, datacenter choisi pour la latence RDC/diaspora (à valider — §8.3, Annexe B) | Répond à l'exigence de disponibilité et de latence |
| Monitoring | Sentry (erreurs), supervision d'uptime et de performance | Détection proactive des incidents, notamment lors de pics d'audience |
| CI/CD | GitHub Actions, environnements dev / staging / production, déploiements conteneurisés (Docker) | Livraisons fréquentes et fiables, cohérentes avec le rythme Scrum |
| Tests | Vitest/Jest (unitaires), Playwright (E2E), k6 (charge) | Couvre la recette fonctionnelle (§15 CDC) et la robustesse en cas de pic (§8.2) |

### Organisation du dépôt (monorepo proposé)

```
co-co-co/
├── apps/
│   ├── web/         # co-co-co.org — site public + espace membre (Next.js)
│   ├── admin/        # admin.co-co-co.org — back-office (React)
│   └── api/          # API REST commune (NestJS)
├── packages/
│   ├── ui/           # composants partagés
│   ├── types/        # types/DTO partagés entre apps
│   └── config/       # config partagée (eslint, tsconfig, tailwind)
├── infra/            # Docker, IaC, scripts de déploiement
└── docs/             # cahier des charges, ADRs, plan de recette, ce document
```

Cette structure matérialise l'exigence du CDC (§3) : « les deux espaces partagent la même base de données et la même couche applicative (API) ».

## 4. Modèle de données — entités de départ

Reprend les entités du §10 du CDC comme point de départ du schéma Prisma, à affiner en Phase 0 :

`Member`, `Sector`, `Category`/`Subcategory`, `Campaign`, `Criterion`, `Vote`, `Comment`, `Report`, `Petition`, `Signature`, `Role`, `AuditLog`.

Points d'attention dès la conception :
- Contrainte d'unicité **(membre, campagne)** sur `Vote` pour garantir « un vote par membre et par campagne ».
- `AuditLog` conçu comme journal *append-only* (jamais modifié) pour rester probant.
- `Comment` avec statut de modération (`pending` / `approved` / `rejected` / `flagged`) et relation de réponse à un niveau (thread simple, §5.2.4).
- `Campaign.status` porte le cycle de vie complet du §5.1 (brouillon → configuration → planifiée → active → clôturée → rapport publié → pétition → archivée).

## 5. Phasage détaillé

Le phasage reprend les 4 phases du cahier des charges (§14) et les découpe en sprints de 2 semaines.

### Phase 0 — Cadrage (3 à 4 semaines)

| Sprint | Objectifs |
|---|---|
| S0.1 | Arbitrage des points de l'Annexe B avec le commanditaire ; choix définitif d'hébergement et de stack ; setup du dépôt, CI/CD, environnements |
| S0.2 | Wireframes puis maquettes haute-fidélité (site + back-office) ; schéma de données détaillé ; rédaction CGU / politique de confidentialité / charte de modération avec le conseil juridique |

**Livrables :** cahier des charges validé, maquettes UX/UI, environnements techniques prêts, schéma de données validé, documents légaux prêts.

### Phase 1 — MVP (10 semaines, 5 sprints)

| Sprint | Contenu |
|---|---|
| S1.1 | Authentification (email/mot de passe + confirmation, connexion Google), profil membre basique |
| S1.2 | Back-office : gestion des secteurs / catégories / sous-catégories (CRUD, activation/désactivation) |
| S1.3 | Module Campagne : fiche, critères d'évaluation configurables, cycle de vie brouillon → publication (back-office + affichage public) |
| S1.4 | Vote public pondéré, anti-fraude (email vérifié, rate limiting IP, captcha), calcul des notes moyennes/pondérées, affichage des résultats |
| S1.5 | Commentaires (fil à un niveau, signalement, modération basique), site vitrine (accueil, page catégorie, page détail campagne), recette de fin de phase |

**Livrable :** plateforme utilisable de bout en bout pour créer une campagne, voter et commenter — critères de recette n°1 à 4 du §15 du CDC couverts.

### Phase 2 — Consolidation (8 semaines, 4 sprints)

| Sprint | Contenu |
|---|---|
| S2.1 | Rapport d'évaluation : synthèse quantitative automatique, édition éditoriale, publication web + export PDF, historique |
| S2.2 | Pétitions : création, formulaire de signature (avec vérification email), compteur temps réel, suivi de statut, export des données |
| S2.3 | Page « Victoires citoyennes », statistiques et tableau de bord avancés (campagnes actives, tendances, membres actifs) |
| S2.4 | Journal d'audit complet, gestion fine des rôles internes (modérateur / rédacteur / administrateur / super-administrateur), renforcement de la modération (files de signalement, SLA de traitement) |

**Livrable :** couverture complète du périmètre fonctionnel du CDC (§2.2) — critères de recette n°5 à 8 du §15 couverts. Point de bascule naturel pour une mise en production publique.

### Phase 3 — Extension (backlog continu, post mise en production)

Priorisation à faire avec le commanditaire selon les retours d'usage réels :

- Multilinguisme (lingala, swahili, anglais) — la structure de contenu est prête dès la V1 (§8.4).
- Notifications (abonnement à une campagne/catégorie, emails puis push).
- Intégrations réseaux sociaux (partage enrichi, éventuel login alternatif).
- Étude de faisabilité application mobile (PWA vs natif) — décision explicitement hors périmètre V1.
- Droit de réponse pour les entités évaluées (modalités à définir avec le commanditaire).
- Intégration avec des cabinets d'avocats partenaires (aujourd'hui : export manuel).
- Signature électronique certifiée des pétitions.

## 6. Recette et qualité

- Un plan de recette est écrit **avant chaque phase**, dérivé des critères du §15 du CDC, et exécuté par le Product Owner + QA avant toute mise en production.
- Tests automatisés obligatoires sur les chemins critiques : vote (unicité, calcul de note), authentification, modération, pétitions (signature + export).
- Un test de charge (k6) est exécuté avant la mise en production de la Phase 1, pour valider la tenue en cas de pic viral (§8.2).
- Revue de sécurité (dépendances, injection, XSS/CSRF, contrôle d'accès par rôle) à chaque fin de phase.

## 7. Gestion des risques

| Risque | Impact | Mitigation |
|---|---|---|
| Pic de trafic viral (campagne ou pétition) | Indisponibilité, perte de confiance | Cache/CDN, architecture horizontale, test de charge avant mise en prod |
| Fraude sur le vote (comptes multiples, bots) | Résultats contestés | Vérification email, rate limiting IP, captcha, monitoring des anomalies |
| Contentieux / diffamation | Risque juridique pour le commanditaire | Charte de modération stricte, modération a priori sur les campagnes sensibles, conseil juridique, droit de réponse |
| Latence RDC / diaspora | Mauvaise expérience utilisateur, abandon | Choix d'hébergement/CDN validé en Phase 0 avec tests de latence réels |
| Sous-dimensionnement de la modération | Backlog de signalements, contenus problématiques en ligne | SLA de traitement défini (§8.6), outillage de file de modération dès la Phase 1 |
| Dérive de périmètre (scope creep) | Retard sur le MVP | Hors-périmètre V1 strictement tenu (§2.3 du CDC), arbitrages Annexe B tranchés en Phase 0 |

## 8. Jalons et durée indicative

| Jalon | Durée cumulée | Contenu |
|---|---|---|
| Fin Phase 0 | ~4 semaines | Cadrage validé, environnements prêts |
| Fin Phase 1 (MVP) | ~14 semaines | Démo publique possible sur périmètre restreint |
| Fin Phase 2 | ~22 semaines | Périmètre fonctionnel complet du CDC, mise en production publique |
| Phase 3 | Continu | Backlog priorisé post-lancement |

*(Durées à ajuster selon la taille réelle de l'équipe confirmée en Phase 0 ; hypothèse ici : 2 devs backend, 2 devs frontend, 1 designer à temps partiel après Phase 0.)*

## 9. Décisions à arbitrer avant/pendant la Phase 0

Reprend l'Annexe B du cahier des charges — chaque point doit avoir un propriétaire et une date de décision avant d'impacter un sprint :

1. Modification du vote autorisée ou non pendant la période active d'une campagne.
2. Modération des commentaires a priori ou a posteriori.
3. Existence et modalités d'un droit de réponse pour les entités évaluées.
4. Périmètre exact V1 de l'application mobile (site responsive uniquement, confirmé).
5. Choix de l'hébergeur et du pays d'hébergement des données.
6. Granularité des rôles internes (fusion ou séparation modérateur / rédacteur / administrateur).
7. Langue(s) à prévoir dès la V1 au-delà du français.

## 10. Prochaines étapes immédiates

1. Valider ce plan et le cahier des charges avec le commanditaire.
2. Constituer l'équipe (§2) et confirmer sa disponibilité pour le phasage proposé (§8).
3. Lancer le Sprint S0.1 : arbitrages de l'Annexe B (§9 ci-dessus), choix d'hébergement, initialisation du monorepo (§3).
4. Démarrer en parallèle les maquettes UX/UI et la rédaction des documents légaux (Sprint S0.2).
