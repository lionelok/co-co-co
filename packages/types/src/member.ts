/**
 * Rôles internes (back-office). Cf. plan de développement §9.6 — la granularité
 * exacte (fusion ou séparation modérateur / rédacteur / administrateur) reste
 * à arbitrer en Phase 0 ; ce type sert de point de départ.
 */
export type InternalRole = 'moderator' | 'editor' | 'admin' | 'super_admin';

/** Membre de la plateforme (espace public / espace membre). */
export interface Member {
  id: string;
  email: string;
  displayName: string;
  emailVerifiedAt: string | null;
  /** Rôle interne, absent pour un membre "simple" du site public. */
  internalRole: InternalRole | null;
  createdAt: string;
}
