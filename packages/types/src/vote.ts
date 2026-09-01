/** Note attribuée par un membre à un critère, dans le cadre d'un vote. */
export interface CriterionScore {
  criterionId: string;
  /** Note sur une échelle 1–5 (à confirmer en Phase 0). */
  score: number;
}

/**
 * Vote d'un membre sur une campagne. Contrainte d'unicité (memberId,
 * campaignId) — cf. plan de développement §4 : « un vote par membre et par
 * campagne ».
 */
export interface Vote {
  id: string;
  memberId: string;
  campaignId: string;
  scores: CriterionScore[];
  /** Note pondérée résultant des scores et des poids des critères. */
  weightedScore: number;
  createdAt: string;
  updatedAt: string;
}
