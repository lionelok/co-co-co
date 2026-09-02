'use client';

import { useRouter } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AuthCard, FormError } from './form-field';
import { useAuth } from '@/lib/auth/auth-context';

export function GoogleCallback() {
  const { applyTokens } = useAuth();
  const router = useRouter();
  const [error, setError] = useState<string | null>(null);
  // Évite un double appel (Strict Mode dev double-invoque les effets au montage).
  const attemptedRef = useRef(false);

  useEffect(() => {
    if (attemptedRef.current) return;
    attemptedRef.current = true;

    // Les jetons transitent par le fragment (#), jamais envoyé au serveur —
    // voir apps/api/src/auth/auth.controller.ts (googleCallback).
    const params = new URLSearchParams(window.location.hash.replace(/^#/, ''));
    const accessToken = params.get('access_token');
    const refreshToken = params.get('refresh_token');

    if (!accessToken || !refreshToken) {
      // Mono-exécution au montage (deps stables) — pas de risque de boucle.
      // eslint-disable-next-line react-hooks/set-state-in-effect
      setError('La connexion Google a échoué : jetons manquants.');
      return;
    }

    applyTokens({ accessToken, refreshToken })
      .then(() => {
        // Nettoie le fragment avant de rediriger, pour ne pas laisser les
        // jetons dans l'historique de navigation.
        window.history.replaceState(null, '', window.location.pathname);
        router.replace('/');
      })
      .catch(() => setError('La connexion Google a échoué.'));
    // eslint-disable-next-line react-hooks/exhaustive-deps -- ne doit s'exécuter qu'au montage
  }, []);

  return (
    <AuthCard title="Connexion avec Google">
      {error ? (
        <FormError message={error} />
      ) : (
        <p className="text-sm text-slate-600">Un instant…</p>
      )}
    </AuthCard>
  );
}
