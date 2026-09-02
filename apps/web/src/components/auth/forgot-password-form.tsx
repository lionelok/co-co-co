'use client';

import { useState } from 'react';
import type { FormEvent } from 'react';
import { AuthCard, FormError, FormField, FormSuccess, SubmitButton } from './form-field';
import { forgotPassword } from '@/lib/auth/api-client';

export function ForgotPasswordForm() {
  const [email, setEmail] = useState('');
  const [error, setError] = useState<string | null>(null);
  const [sent, setSent] = useState(false);
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: FormEvent) {
    event.preventDefault();
    setError(null);
    setPending(true);
    try {
      await forgotPassword(email);
      // Réponse volontairement identique que le compte existe ou non
      // (l'API ne permet pas l'énumération d'emails) — voir apps/api.
      setSent(true);
    } catch {
      setError("Une erreur est survenue. Vérifiez que l'API tourne en local.");
    } finally {
      setPending(false);
    }
  }

  if (sent) {
    return (
      <AuthCard title="Vérifiez votre boîte mail">
        <FormSuccess message="Si un compte existe avec cet email, un lien de réinitialisation vient d'être envoyé." />
      </AuthCard>
    );
  }

  return (
    <AuthCard title="Mot de passe oublié">
      <form onSubmit={handleSubmit} className="flex flex-col gap-4">
        <FormError message={error} />
        <p className="text-sm text-slate-600">
          Indiquez votre email : si un compte existe, vous recevrez un lien de réinitialisation.
        </p>
        <FormField
          id="email"
          label="Email"
          type="email"
          autoComplete="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
        />
        <SubmitButton pending={pending}>Envoyer le lien</SubmitButton>
      </form>
    </AuthCard>
  );
}
