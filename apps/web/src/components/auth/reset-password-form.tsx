'use client';

import Link from 'next/link';
import { useSearchParams } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AuthCard, FormError, FormField, FormSuccess, SubmitButton } from './form-field';
import { ApiError, resetPassword } from '@/lib/auth/api-client';

export function ResetPasswordForm() {
  const searchParams = useSearchParams();
  const token = searchParams.get('token');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [done, setDone] = useState(false);
  const [pending, setPending] = useState(false);

  if (!token) {
    return (
      <AuthCard title="Lien invalide">
        <FormError message="Ce lien de réinitialisation est incomplet. Redemandez-en un depuis la page « mot de passe oublié »." />
      </AuthCard>
    );
  }

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await resetPassword(token as string, password);
      setDone(true);
    } catch (err) {
      setError(err instanceof ApiError ? err.message : 'Une erreur est survenue.');
    } finally {
      setPending(false);
    }
  }

  if (done) {
    return (
      <AuthCard title="Mot de passe mis à jour">
        <FormSuccess message="Votre mot de passe a été changé. Vos autres sessions ont été déconnectées." />
        <Link
          href="/connexion"
          className="rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700"
        >
          Se connecter
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Choisir un nouveau mot de passe">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormError message={error} />
        <FormField
          id="password"
          label="Nouveau mot de passe"
          type="password"
          autoComplete="new-password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-slate-500">Au moins 10 caractères.</p>
        <SubmitButton pending={pending}>Valider</SubmitButton>
      </form>
    </AuthCard>
  );
}
