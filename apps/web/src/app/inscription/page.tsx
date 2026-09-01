import type { Metadata } from 'next';
import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = { title: 'Inscription' };

export default function InscriptionPage() {
  return (
    <ComingSoon
      title="Inscription"
      note="La création de compte membre arrive au sprint S1.1 du plan de développement."
    />
  );
}
