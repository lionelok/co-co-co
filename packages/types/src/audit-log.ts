/**
 * Journal d'audit — append-only, jamais modifié, pour rester probant
 * (plan de développement §4).
 */
export interface AuditLog {
  id: string;
  actorId: string;
  action: string;
  targetType: string;
  targetId: string;
  metadata: Record<string, unknown>;
  createdAt: string;
}
