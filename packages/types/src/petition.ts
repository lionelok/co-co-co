export type PetitionStatus = 'draft' | 'active' | 'closed' | 'delivered';

/** Pétition rattachée à une campagne (issue d'un rapport, §2.2 CDC). */
export interface Petition {
  id: string;
  campaignId: string;
  title: string;
  body: string;
  targetSignatureCount: number | null;
  status: PetitionStatus;
  createdAt: string;
  updatedAt: string;
}

/** Signature d'une pétition, avec vérification email (§4 CDC). */
export interface Signature {
  id: string;
  petitionId: string;
  memberId: string;
  emailVerifiedAt: string | null;
  createdAt: string;
}
