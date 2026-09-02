'use client';

import { createContext, useCallback, useContext, useEffect, useMemo, useState } from 'react';
import type { ReactNode } from 'react';
import * as api from './api-client';
import { clearStoredTokens, getStoredTokens, storeTokens } from './token-storage';

type AuthStatus = 'loading' | 'authenticated' | 'unauthenticated';

interface AuthContextValue {
  status: AuthStatus;
  member: api.MemberProfile | null;
  login: (input: { email: string; password: string }) => Promise<void>;
  logout: () => Promise<void>;
  /** Réapplique les jetons stockés (ex. après le callback Google) et recharge le profil. */
  applyTokens: (tokens: api.AuthTokens) => Promise<void>;
}

const AuthContext = createContext<AuthContextValue | null>(null);

export function AuthProvider({ children }: { children: ReactNode }) {
  const [status, setStatus] = useState<AuthStatus>('loading');
  const [member, setMember] = useState<api.MemberProfile | null>(null);

  const loadFromStoredTokens = useCallback(async () => {
    const tokens = getStoredTokens();
    if (!tokens) {
      setStatus('unauthenticated');
      return;
    }

    try {
      const profile = await api.me(tokens.accessToken);
      setMember(profile);
      setStatus('authenticated');
    } catch {
      // Access token expiré : on tente un refresh avant d'abandonner.
      try {
        const refreshed = await api.refresh(tokens.refreshToken);
        storeTokens(refreshed);
        const profile = await api.me(refreshed.accessToken);
        setMember(profile);
        setStatus('authenticated');
      } catch {
        clearStoredTokens();
        setMember(null);
        setStatus('unauthenticated');
      }
    }
  }, []);

  useEffect(() => {
    // Chargement de la session au montage — mono-exécution (deps stables),
    // pas de risque de boucle de rendu malgré ce que suspecte la règle.
    // eslint-disable-next-line react-hooks/set-state-in-effect
    void loadFromStoredTokens();
  }, [loadFromStoredTokens]);

  const applyTokens = useCallback(async (tokens: api.AuthTokens) => {
    storeTokens(tokens);
    const profile = await api.me(tokens.accessToken);
    setMember(profile);
    setStatus('authenticated');
  }, []);

  const login = useCallback(
    async (input: { email: string; password: string }) => {
      const result = await api.login(input);
      await applyTokens(result);
    },
    [applyTokens],
  );

  const logout = useCallback(async () => {
    const tokens = getStoredTokens();
    if (tokens) {
      await api.logout(tokens.refreshToken).catch(() => {
        // Le jeton est peut-être déjà expiré/révoqué côté serveur — sans
        // conséquence, on nettoie l'état local dans tous les cas.
      });
    }
    clearStoredTokens();
    setMember(null);
    setStatus('unauthenticated');
  }, []);

  const value = useMemo(
    () => ({ status, member, login, logout, applyTokens }),
    [status, member, login, logout, applyTokens],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth(): AuthContextValue {
  const context = useContext(AuthContext);
  if (!context) {
    throw new Error('useAuth doit être utilisé sous <AuthProvider>.');
  }
  return context;
}
