import type { Metadata } from 'next';
import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = { title: 'Pétitions' };

export default function PetitionsPage() {
  return (
    <ComingSoon
      title="Pétitions"
      note="Le module pétitions (création, signature vérifiée, suivi) arrive en Phase 2 (sprint S2.2) du plan de développement."
    />
  );
}
