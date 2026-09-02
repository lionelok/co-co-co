import type { InternalRole as InternalRoleDto, Member as MemberDto } from '@co-co-co/types';
import type { InternalRole as InternalRoleRecord, Member as MemberRecord } from '@prisma/client';

/** L'enum Prisma est en SCREAMING_CASE (convention base de données) ; le DTO partagé en snake_case. */
const INTERNAL_ROLE_TO_DTO: Record<InternalRoleRecord, InternalRoleDto> = {
  MODERATOR: 'moderator',
  EDITOR: 'editor',
  ADMIN: 'admin',
  SUPER_ADMIN: 'super_admin',
};

/** Projette l'enregistrement Prisma vers le DTO public partagé (`@co-co-co/types`) — jamais `passwordHash`. */
export function toMemberProfile(member: MemberRecord): MemberDto {
  return {
    id: member.id,
    email: member.email,
    displayName: member.displayName,
    emailVerifiedAt: member.emailVerifiedAt?.toISOString() ?? null,
    internalRole: member.internalRole ? INTERNAL_ROLE_TO_DTO[member.internalRole] : null,
    createdAt: member.createdAt.toISOString(),
  };
}
