'use client';

import Link from 'next/link';
import { useAuth } from '@/lib/auth/auth-context';

const NAV_LINKS = [
  { href: '/', label: 'Accueil' },
  { href: '/#secteurs', label: 'Secteurs' },
  { href: '/petitions', label: 'Pétitions' },
  { href: '/victoires', label: 'Victoires citoyennes' },
];

export function SiteHeader() {
  const { status, member, logout } = useAuth();

  return (
    <header className="border-b border-slate-200 bg-white">
      <div className="mx-auto flex max-w-6xl items-center justify-between px-4 py-4 sm:px-6">
        <Link href="/" className="flex items-baseline gap-2">
          <span className="text-xl font-bold tracking-tight text-slate-900">CO-CO-CO</span>
          <span className="hidden text-sm text-slate-500 sm:inline">évaluation citoyenne</span>
        </Link>
        <nav className="flex items-center gap-6">
          {NAV_LINKS.map((link) => (
            <Link
              key={link.href}
              href={link.href}
              className="text-sm font-medium text-slate-600 hover:text-slate-900"
            >
              {link.label}
            </Link>
          ))}
        </nav>
        <div className="flex items-center gap-3">
          {status === 'authenticated' && member ? (
            <>
              <span className="text-sm text-slate-600">
                Bonjour, <span className="font-medium text-slate-900">{member.displayName}</span>
              </span>
              <button
                type="button"
                onClick={() => void logout()}
                className="rounded-full border border-slate-200 px-4 py-2 text-sm font-medium text-slate-700 hover:border-slate-400"
              >
                Déconnexion
              </button>
            </>
          ) : (
            <>
              <Link
                href="/connexion"
                className="text-sm font-medium text-slate-600 hover:text-slate-900"
              >
                Connexion
              </Link>
              <Link
                href="/inscription"
                className="rounded-full bg-slate-900 px-4 py-2 text-sm font-semibold text-white hover:bg-slate-700"
              >
                Rejoindre
              </Link>
            </>
          )}
        </div>
      </div>
    </header>
  );
}
