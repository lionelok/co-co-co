import type { Metadata } from 'next';
import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = { title: 'Connexion' };

export default function ConnexionPage() {
  return (
    <ComingSoon
      title="Connexion"
      note="L'authentification (email/mot de passe et connexion Google) arrive au sprint S1.1 du plan de développement."
    />
  );
}
