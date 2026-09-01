/** Rapport d'évaluation publié à la clôture d'une campagne (§2.2 / §4 CDC). */
export interface Report {
  id: string;
  campaignId: string;
  /** Synthèse quantitative générée automatiquement. */
  summary: string;
  /** Contenu éditorial rédigé/édité par l'équipe de rédaction. */
  editorialContent: string;
  pdfUrl: string | null;
  publishedAt: string | null;
  createdAt: string;
  updatedAt: string;
}
