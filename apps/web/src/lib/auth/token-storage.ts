/**
 * Stockage des jetons en localStorage — choix simple pour ce sprint. Expose
 * le compte à un vol XSS (contrairement à un cookie httpOnly) ; à
 * reconsidérer avant mise en production (ex. proxifier l'auth via des Route
 * Handlers Next.js qui posent des cookies httpOnly).
 */
const ACCESS_TOKEN_KEY = 'coco.accessToken';
const REFRESH_TOKEN_KEY = 'coco.refreshToken';

function isBrowser(): boolean {
  return typeof window !== 'undefined';
}

export function getStoredTokens(): { accessToken: string; refreshToken: string } | null {
  if (!isBrowser()) return null;
  const accessToken = window.localStorage.getItem(ACCESS_TOKEN_KEY);
  const refreshToken = window.localStorage.getItem(REFRESH_TOKEN_KEY);
  if (!accessToken || !refreshToken) return null;
  return { accessToken, refreshToken };
}

export function storeTokens(tokens: { accessToken: string; refreshToken: string }): void {
  if (!isBrowser()) return;
  window.localStorage.setItem(ACCESS_TOKEN_KEY, tokens.accessToken);
  window.localStorage.setItem(REFRESH_TOKEN_KEY, tokens.refreshToken);
}

export function clearStoredTokens(): void {
  if (!isBrowser()) return;
  window.localStorage.removeItem(ACCESS_TOKEN_KEY);
  window.localStorage.removeItem(REFRESH_TOKEN_KEY);
}
