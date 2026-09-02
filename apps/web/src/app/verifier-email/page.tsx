import type { Metadata } from 'next';
import { Suspense } from 'react';
import { VerifyEmailStatus } from '@/components/auth/verify-email-status';

export const metadata: Metadata = { title: 'Vérification de l’email' };

export default function VerifierEmailPage() {
  return (
    <Suspense>
      <VerifyEmailStatus />
    </Suspense>
  );
}
