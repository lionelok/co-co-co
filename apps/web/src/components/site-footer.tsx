export function SiteFooter() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50">
      <div className="mx-auto max-w-6xl px-4 py-10 text-sm text-slate-500 sm:px-6">
        <p>
          CO-CO-CO — plateforme d&apos;évaluation citoyenne pour la communauté congolaise (RDC et
          diaspora).
        </p>
        <p className="mt-2">
          © {new Date().getFullYear()} CO-CO-CO. Site en cours de développement — voir le{' '}
          <a
            href="https://github.com/lionelok/co-co-co/blob/main/docs/plan-de-developpement.md"
            className="underline hover:text-slate-700"
          >
            plan de développement
          </a>
          .
        </p>
      </div>
    </footer>
  );
}
