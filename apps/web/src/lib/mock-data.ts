/**
 * Données de démonstration pour le développement du site vitrine (sprint
 * S1.5 du plan de développement) — en attendant le branchement sur l'API
 * (apps/api, non initialisée).
 *
 * Structure conforme aux types partagés `@co-co-co/types`.
 */
import type { Campaign, Category, Sector } from '@co-co-co/types';

export const sectors: Sector[] = [
  {
    id: 'sec-politique',
    slug: 'politique',
    name: 'Politique',
    description: 'Élu·e·s, institutions et action publique.',
    active: true,
    order: 1,
  },
  {
    id: 'sec-economie',
    slug: 'economie',
    name: 'Économie',
    description: 'Entreprises, projets et acteurs économiques.',
    active: true,
    order: 2,
  },
  {
    id: 'sec-justice',
    slug: 'justice',
    name: 'Justice',
    description: 'Institutions judiciaires et droits des citoyens.',
    active: true,
    order: 3,
  },
];

export const categories: Category[] = [
  {
    id: 'cat-gouvernement',
    sectorId: 'sec-politique',
    slug: 'gouvernement',
    name: 'Gouvernement',
    description: 'Membres du gouvernement et actions ministérielles.',
    active: true,
    order: 1,
  },
  {
    id: 'cat-parlement',
    sectorId: 'sec-politique',
    slug: 'parlement',
    name: 'Parlement',
    description: 'Assemblée nationale et Sénat.',
    active: true,
    order: 2,
  },
  {
    id: 'cat-infrastructures',
    sectorId: 'sec-economie',
    slug: 'infrastructures',
    name: 'Infrastructures',
    description: 'Grands projets d’infrastructure et travaux publics.',
    active: true,
    order: 1,
  },
];

export const campaigns: Campaign[] = [
  {
    id: 'camp-1',
    slug: 'ministre-des-transports-bilan-2026',
    title: 'Bilan 2026 du Ministère des Transports',
    summary:
      "Évaluation citoyenne de l'action du Ministère des Transports sur l'année écoulée : entretien routier, sécurité et transparence.",
    entityName: 'Ministère des Transports',
    sectorId: 'sec-politique',
    categoryId: 'cat-gouvernement',
    subcategoryId: null,
    status: 'active',
    coverImageUrl: null,
    criteria: [
      {
        id: 'crit-1',
        campaignId: 'camp-1',
        label: 'Transparence',
        description: '',
        weight: 1,
        order: 1,
      },
      {
        id: 'crit-2',
        campaignId: 'camp-1',
        label: 'Efficacité',
        description: '',
        weight: 1.5,
        order: 2,
      },
      {
        id: 'crit-3',
        campaignId: 'camp-1',
        label: 'Écoute citoyenne',
        description: '',
        weight: 1,
        order: 3,
      },
    ],
    startsAt: '2026-08-01T00:00:00.000Z',
    endsAt: '2026-09-30T00:00:00.000Z',
    averageScore: 2.8,
    voteCount: 1423,
    createdAt: '2026-07-20T00:00:00.000Z',
    updatedAt: '2026-08-25T00:00:00.000Z',
  },
  {
    id: 'camp-2',
    slug: 'route-nationale-1-rehabilitation',
    title: 'Réhabilitation de la Route Nationale 1',
    summary:
      'Suivi citoyen du chantier de réhabilitation de la RN1 : avancement, qualité des travaux et respect des délais.',
    entityName: 'Office des Routes',
    sectorId: 'sec-economie',
    categoryId: 'cat-infrastructures',
    subcategoryId: null,
    status: 'active',
    coverImageUrl: null,
    criteria: [
      {
        id: 'crit-4',
        campaignId: 'camp-2',
        label: 'Avancement des travaux',
        description: '',
        weight: 1,
        order: 1,
      },
      {
        id: 'crit-5',
        campaignId: 'camp-2',
        label: 'Qualité perçue',
        description: '',
        weight: 1,
        order: 2,
      },
    ],
    startsAt: '2026-06-01T00:00:00.000Z',
    endsAt: '2026-12-01T00:00:00.000Z',
    averageScore: 3.4,
    voteCount: 856,
    createdAt: '2026-05-15T00:00:00.000Z',
    updatedAt: '2026-08-20T00:00:00.000Z',
  },
  {
    id: 'camp-3',
    slug: 'assemblee-nationale-session-2026',
    title: 'Session parlementaire 2026',
    summary:
      "Évaluation du travail législatif de l'Assemblée nationale durant la session ordinaire.",
    entityName: 'Assemblée nationale',
    sectorId: 'sec-politique',
    categoryId: 'cat-parlement',
    subcategoryId: null,
    status: 'scheduled',
    coverImageUrl: null,
    criteria: [
      {
        id: 'crit-6',
        campaignId: 'camp-3',
        label: 'Assiduité',
        description: '',
        weight: 1,
        order: 1,
      },
      {
        id: 'crit-7',
        campaignId: 'camp-3',
        label: 'Qualité des lois votées',
        description: '',
        weight: 1.5,
        order: 2,
      },
    ],
    startsAt: '2026-10-01T00:00:00.000Z',
    endsAt: null,
    averageScore: null,
    voteCount: 0,
    createdAt: '2026-08-28T00:00:00.000Z',
    updatedAt: '2026-08-28T00:00:00.000Z',
  },
];

export function getSectorBySlug(slug: string): Sector | undefined {
  return sectors.find((sector) => sector.slug === slug);
}

export function getCategoryBySlug(slug: string): Category | undefined {
  return categories.find((category) => category.slug === slug);
}

export function getCampaignBySlug(slug: string): Campaign | undefined {
  return campaigns.find((campaign) => campaign.slug === slug);
}

export function getCampaignsByCategory(categoryId: string): Campaign[] {
  return campaigns.filter((campaign) => campaign.categoryId === categoryId);
}

export function getCategoriesBySector(sectorId: string): Category[] {
  return categories.filter((category) => category.sectorId === sectorId);
}

export function getFeaturedCampaigns(): Campaign[] {
  return campaigns.filter((campaign) => campaign.status === 'active');
}
