/** Statut de modération d'un commentaire — cf. plan de développement §4. */
export type CommentStatus = 'pending' | 'approved' | 'rejected' | 'flagged';

/** Commentaire sur une campagne, avec fil de réponse à un niveau (§5.2.4 CDC). */
export interface Comment {
  id: string;
  campaignId: string;
  memberId: string;
  /** Référence au commentaire parent pour une réponse (un seul niveau). */
  parentId: string | null;
  body: string;
  status: CommentStatus;
  reportCount: number;
  createdAt: string;
  updatedAt: string;
}
