/**
 * Client pour l'API d'authentification (`apps/api`). Ne fonctionne qu'en
 * local pour l'instant : l'API n'est pas encore déployée (choix d'hébergeur
 * à trancher en Phase 0, cf. plan de développement §9.5) — sur la preview
 * Vercel, ces appels échoueront tant que `NEXT_PUBLIC_API_URL` ne pointe pas
 * vers une API réellement accessible.
 */
const API_URL = process.env.NEXT_PUBLIC_API_URL ?? 'http://localhost:3001';

export class ApiError extends Error {
  constructor(
    message: string,
    public readonly status: number,
  ) {
    super(message);
    this.name = 'ApiError';
  }
}

async function apiFetch<T>(path: string, init?: RequestInit): Promise<T> {
  const response = await fetch(`${API_URL}${path}`, {
    ...init,
    headers: { 'Content-Type': 'application/json', ...init?.headers },
  });

  if (!response.ok) {
    const body = await response.json().catch(() => null);
    throw new ApiError(body?.message ?? `Erreur ${response.status}`, response.status);
  }

  if (response.status === 204) {
    return undefined as T;
  }

  return (await response.json()) as T;
}

export interface MemberProfile {
  id: string;
  email: string;
  displayName: string;
  emailVerifiedAt: string | null;
  internalRole: string | null;
  createdAt: string;
}

export interface AuthTokens {
  accessToken: string;
  refreshToken: string;
}

export function register(input: { email: string; password: string; displayName: string }) {
  return apiFetch<{ member: MemberProfile }>('/auth/register', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function login(input: { email: string; password: string }) {
  return apiFetch<AuthTokens & { member: MemberProfile }>('/auth/login', {
    method: 'POST',
    body: JSON.stringify(input),
  });
}

export function refresh(refreshToken: string) {
  return apiFetch<AuthTokens>('/auth/refresh', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function logout(refreshToken: string) {
  return apiFetch<void>('/auth/logout', {
    method: 'POST',
    body: JSON.stringify({ refreshToken }),
  });
}

export function me(accessToken: string) {
  return apiFetch<MemberProfile>('/members/me', {
    headers: { Authorization: `Bearer ${accessToken}` },
  });
}

export function verifyEmail(token: string) {
  return apiFetch<{ verified: true }>(`/auth/verify-email?token=${encodeURIComponent(token)}`);
}

export function forgotPassword(email: string) {
  return apiFetch<{ ok: true }>('/auth/forgot-password', {
    method: 'POST',
    body: JSON.stringify({ email }),
  });
}

export function resetPassword(token: string, password: string) {
  return apiFetch<{ ok: true }>('/auth/reset-password', {
    method: 'POST',
    body: JSON.stringify({ token, password }),
  });
}

/** URL de démarrage du flux OAuth2 Google (redirection plein-écran, pas un fetch). */
export function googleLoginUrl(): string {
  return `${API_URL}/auth/google`;
}
