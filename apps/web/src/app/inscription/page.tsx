import type { Metadata } from 'next';
import { InscriptionForm } from '@/components/auth/inscription-form';

export const metadata: Metadata = { title: 'Inscription' };

export default function InscriptionPage() {
  return <InscriptionForm />;
}
