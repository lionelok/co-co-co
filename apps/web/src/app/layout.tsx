import type { Metadata } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import type { ReactNode } from 'react';
import { SiteFooter } from '@/components/site-footer';
import { SiteHeader } from '@/components/site-header';
import { AuthProvider } from '@/lib/auth/auth-context';
import './globals.css';

const geistSans = Geist({
  variable: '--font-geist-sans',
  subsets: ['latin'],
});

const geistMono = Geist_Mono({
  variable: '--font-geist-mono',
  subsets: ['latin'],
});

export const metadata: Metadata = {
  title: {
    default: 'CO-CO-CO — évaluation citoyenne',
    template: '%s · CO-CO-CO',
  },
  description:
    "Plateforme d'évaluation citoyenne pour la communauté congolaise (RDC et diaspora) : campagnes d'évaluation, votes pondérés, commentaires, rapports et pétitions.",
};

// `LayoutProps<'/'>` (routes typées Next.js) dépend de `.next/types`, généré
// uniquement après un premier `next dev`/`next build` — absent sur un
// checkout CI neuf où `typecheck` tourne avant `build`. Typage explicite,
// portable, pour éviter cette dépendance d'ordre d'exécution.
export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="fr" className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-slate-50 font-sans text-slate-900">
        <AuthProvider>
          <SiteHeader />
          <main className="flex-1">{children}</main>
          <SiteFooter />
        </AuthProvider>
      </body>
    </html>
  );
}
