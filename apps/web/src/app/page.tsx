import Link from 'next/link';
import { CampaignCard } from '@/components/campaign-card';
import { SectorCard } from '@/components/sector-card';
import { getCategoriesBySector, getFeaturedCampaigns, sectors } from '@/lib/mock-data';

export default function Home() {
  const featuredCampaigns = getFeaturedCampaigns();

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <section className="rounded-2xl bg-slate-900 px-6 py-16 text-center text-white sm:px-12">
        <h1 className="mx-auto max-w-2xl text-3xl font-bold tracking-tight sm:text-4xl">
          Évaluez l&apos;action publique. Faites entendre votre voix.
        </h1>
        <p className="mx-auto mt-4 max-w-xl text-slate-300">
          CO-CO-CO permet à la communauté congolaise, en RDC comme dans la diaspora, de noter,
          commenter et suivre l&apos;action des institutions et des personnalités publiques.
        </p>
        <div className="mt-8 flex justify-center gap-4">
          <Link
            href="/inscription"
            className="rounded-full bg-white px-6 py-3 text-sm font-semibold text-slate-900 hover:bg-slate-200"
          >
            Rejoindre la plateforme
          </Link>
          <Link
            href="#campagnes"
            className="rounded-full border border-white/30 px-6 py-3 text-sm font-semibold text-white hover:bg-white/10"
          >
            Voir les campagnes en cours
          </Link>
        </div>
      </section>

      <section id="campagnes" className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900">Campagnes en cours</h2>
        <p className="mt-1 text-slate-600">Donnez votre avis pendant que le vote est ouvert.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {featuredCampaigns.map((campaign) => (
            <CampaignCard key={campaign.id} campaign={campaign} />
          ))}
        </div>
      </section>

      <section id="secteurs" className="mt-16">
        <h2 className="text-2xl font-bold text-slate-900">Secteurs</h2>
        <p className="mt-1 text-slate-600">Explorez les campagnes par grand secteur.</p>
        <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {sectors.map((sector) => (
            <SectorCard
              key={sector.id}
              sector={sector}
              categories={getCategoriesBySector(sector.id)}
            />
          ))}
        </div>
      </section>
    </div>
  );
}
