import { createHash, randomBytes } from 'node:crypto';

/**
 * Jetons "opaques" (refresh token, vérification d'email) : on génère une
 * valeur aléatoire renvoyée une seule fois à l'appelant, et on ne persiste
 * que son hash SHA-256 — un accès en lecture à la base ne permet donc pas
 * de rejouer un jeton.
 */
export function generateOpaqueToken(): { token: string; tokenHash: string } {
  const token = randomBytes(32).toString('base64url');
  return { token, tokenHash: hashOpaqueToken(token) };
}

export function hashOpaqueToken(token: string): string {
  return createHash('sha256').update(token).digest('hex');
}
