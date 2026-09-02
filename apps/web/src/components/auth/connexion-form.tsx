'use client';

import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { useState } from 'react';
import type { FormEvent } from 'react';
import { AuthCard, FormError, FormField, GoogleButton, SubmitButton } from './form-field';
import { ApiError, googleLoginUrl } from '@/lib/auth/api-client';
import { useAuth } from '@/lib/auth/auth-context';

export function ConnexionForm() {
  const { login } = useAuth();
  const router = useRouter();
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await login({ email, password });
      router.push('/');
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "La connexion a échoué. Vérifiez que l'API tourne en local (voir apps/api/README.md).",
      );
    } finally {
      setPending(false);
    }
  }

  return (
    <AuthCard title="Connexion">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormError message={error} />
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <FormField
          id="password"
          label="Mot de passe"
          type="password"
          autoComplete="current-password"
          required
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <div className="flex items-center justify-between">
          <SubmitButton pending={pending}>Se connecter</SubmitButton>
          <Link href="/mot-de-passe-oublie" className="text-sm text-slate-600 hover:underline">
            Mot de passe oublié ?
          </Link>
        </div>
      </form>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        ou
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <GoogleButton href={googleLoginUrl()} />
      <p className="text-center text-sm text-slate-600">
        Pas encore de compte ?{' '}
        <Link href="/inscription" className="font-medium text-slate-900 hover:underline">
          Rejoindre la plateforme
        </Link>
      </p>
    </AuthCard>
  );
}
