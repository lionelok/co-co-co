import type { Metadata } from 'next';
import { ConnexionForm } from '@/components/auth/connexion-form';

export const metadata: Metadata = { title: 'Connexion' };

export default function ConnexionPage() {
  return <ConnexionForm />;
}
