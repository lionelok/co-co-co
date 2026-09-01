import type { Metadata } from 'next';
import { ComingSoon } from '@/components/coming-soon';

export const metadata: Metadata = { title: 'Victoires citoyennes' };

export default function VictoiresPage() {
  return (
    <ComingSoon
      title="Victoires citoyennes"
      note="La page « Victoires citoyennes » arrive en Phase 2 (sprint S2.3) du plan de développement."
    />
  );
}
