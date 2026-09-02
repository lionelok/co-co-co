/**
 * Cycle de vie d'une campagne — cf. plan de développement §4 / cahier des
 * charges §5.1 : brouillon → configuration → planifiée → active → clôturée
 * → rapport publié → pétition → archivée.
 */
export type CampaignStatus =
  | 'draft'
  | 'configuration'
  | 'scheduled'
  | 'active'
  | 'closed'
  | 'report_published'
  | 'petition'
  | 'archived';

/** Critère d'évaluation configurable pour une campagne. */
export interface Criterion {
  id: string;
  campaignId: string;
  label: string;
  description: string;
  /** Poids relatif du critère dans le calcul de la note pondérée. */
  weight: number;
  order: number;
}

/** Fiche de campagne d'évaluation (l'entité centrale de la plateforme). */
export interface Campaign {
  id: string;
  slug: string;
  title: string;
  summary: string;
  /** Nom de l'entité évaluée (personnalité publique, institution, projet…). */
  entityName: string;
  sectorId: string;
  categoryId: string;
  subcategoryId: string | null;
  status: CampaignStatus;
  coverImageUrl: string | null;
  criteria: Criterion[];
  startsAt: string | null;
  endsAt: string | null;
  /** Note moyenne pondérée, calculée à partir des votes ; null tant qu'aucun vote. */
  averageScore: number | null;
  voteCount: number;
  createdAt: string;
  updatedAt: string;
}
