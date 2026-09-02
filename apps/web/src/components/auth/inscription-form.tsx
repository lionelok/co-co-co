'use client';

import Link from 'next/link';
import { useState } from 'react';
import type { FormEvent } from 'react';
import {
  AuthCard,
  FormError,
  FormField,
  FormSuccess,
  GoogleButton,
  SubmitButton,
} from './form-field';
import { ApiError, googleLoginUrl, register } from '@/lib/auth/api-client';

export function InscriptionForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [displayName, setDisplayName] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await register({ email, password, displayName });
      setSuccess(true);
    } catch (err) {
      setError(
        err instanceof ApiError
          ? err.message
          : "L'inscription a échoué. Vérifiez que l'API tourne en local (voir apps/api/README.md).",
      );
    } finally {
      setPending(false);
    }
  }

  if (success) {
    return (
      <AuthCard title="Compte créé">
        <FormSuccess message="Vérifiez votre boîte mail pour confirmer votre adresse, puis connectez-vous." />
        <Link
          href="/connexion"
          className="rounded-full bg-slate-900 px-5 py-2.5 text-center text-sm font-semibold text-white hover:bg-slate-700"
        >
          Aller à la connexion
        </Link>
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Rejoindre la plateforme">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormError message={error} />
        <FormField
          id="displayName"
          label="Nom affiché"
          type="text"
          autoComplete="name"
          required
          minLength={2}
          value={displayName}
          onChange={(e) => setDisplayName(e.target.value)}
        />
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
          autoComplete="new-password"
          required
          minLength={10}
          value={password}
          onChange={(e) => setPassword(e.target.value)}
        />
        <p className="text-xs text-slate-500">Au moins 10 caractères.</p>
        <SubmitButton pending={pending}>Créer mon compte</SubmitButton>
      </form>
      <div className="flex items-center gap-3 text-xs text-slate-400">
        <div className="h-px flex-1 bg-slate-200" />
        ou
        <div className="h-px flex-1 bg-slate-200" />
      </div>
      <GoogleButton href={googleLoginUrl()} />
      <p className="text-center text-sm text-slate-600">
        Déjà un compte ?{' '}
        <Link href="/connexion" className="font-medium text-slate-900 hover:underline">
          Se connecter
        </Link>
      </p>
    </AuthCard>
  );
}
