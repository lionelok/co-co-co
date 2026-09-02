'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useEffect, useRef, useState } from 'react';
import { AuthCard, FormError, FormSuccess } from './form-field';
import { verifyEmail } from '@/lib/auth/api-client';

type Status = 'verifying' | 'success' | 'error';

export function VerifyEmailStatus() {
  const token = useSearchParams().get('token');
  const [status, setStatus] = useState<Status>(token ? 'verifying' : 'error');
  // Le jeton est à usage unique : en dev, le Strict Mode de React invoque cet
  // effet deux fois au montage. Sans cette garde, la 2ᵉ invocation rejoue le
  // même jeton déjà consommé par la 1ʳᵉ et son échec écrase le succès.
  const attemptedTokenRef = useRef<string | null>(null);

  useEffect(() => {
    if (!token || attemptedTokenRef.current === token) return;
    attemptedTokenRef.current = token;

    verifyEmail(token)
      .then(() => setStatus('success'))
      .catch(() => setStatus('error'));
  }, [token]);

  return (
    <AuthCard title="Vérification de l'email">
      {status === 'verifying' && <p className="text-sm text-slate-600">Vérification en cours…</p>}
      {status === 'success' && (
        <>
          <FormSuccess message="Votre adresse email est confirmée." />
          <Link
            href="/connexion"
            className="rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700"
          >
            Se connecter
          </Link>
        </>
      )}
      {status === 'error' && (
        <FormError message="Ce lien de vérification est invalide ou a expiré." />
      )}
    </AuthCard>
  );
}
