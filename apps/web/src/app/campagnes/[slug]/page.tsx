import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { Badge, ScoreBadge } from '@co-co-co/ui';
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_TONES } from '@/lib/campaign-status';
import { campaigns, categories, getCampaignBySlug, sectors } from '@/lib/mock-data';

type CampaignPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return campaigns.map((campaign) => ({ slug: campaign.slug }));
}

export async function generateMetadata({ params }: CampaignPageProps): Promise<Metadata> {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);

  if (!campaign) {
    return {};
  }

  return {
    title: campaign.title,
    description: campaign.summary,
  };
}

export default async function CampaignPage({ params }: CampaignPageProps) {
  const { slug } = await params;
  const campaign = getCampaignBySlug(slug);

  if (!campaign) {
    notFound();
  }

  const category = categories.find((c) => c.id === campaign.categoryId);
  const sector = sectors.find((s) => s.id === campaign.sectorId);

  return (
    <div className="mx-auto max-w-4xl px-4 py-12 sm:px-6">
      <nav className="text-sm text-slate-500">
        {sector && <span>{sector.name}</span>}
        {category && (
          <>
            {' '}
            /{' '}
            <Link href={`/categories/${category.slug}`} className="hover:underline">
              {category.name}
            </Link>
          </>
        )}
      </nav>

      <div className="mt-3 flex items-center gap-3">
        <Badge tone={CAMPAIGN_STATUS_TONES[campaign.status]}>
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </Badge>
        <span className="text-sm text-slate-500">{campaign.entityName}</span>
      </div>

      <h1 className="mt-2 text-3xl font-bold text-slate-900">{campaign.title}</h1>
      <p className="mt-3 max-w-2xl text-slate-600">{campaign.summary}</p>

      <div className="mt-6 flex flex-wrap items-center gap-6 rounded-xl border border-slate-200 bg-white p-5">
        <ScoreBadge score={campaign.averageScore} voteCount={campaign.voteCount} />
        {campaign.status === 'active' ? (
          <Link
            href="/connexion"
            className="ml-auto rounded-full bg-slate-900 px-5 py-2.5 text-sm font-semibold text-white hover:bg-slate-700"
          >
            Voter maintenant
          </Link>
        ) : (
          <span className="ml-auto text-sm text-slate-500">Le vote n&apos;est pas ouvert.</span>
        )}
      </div>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Critères d&apos;évaluation</h2>
        <ul className="mt-4 space-y-3">
          {campaign.criteria.map((criterion) => (
            <li
              key={criterion.id}
              className="flex items-center justify-between rounded-lg border border-slate-200 bg-white px-4 py-3"
            >
              <span className="font-medium text-slate-800">{criterion.label}</span>
              <span className="text-xs text-slate-400">poids × {criterion.weight}</span>
            </li>
          ))}
        </ul>
      </section>

      <section className="mt-10">
        <h2 className="text-xl font-semibold text-slate-900">Commentaires</h2>
        <p className="mt-2 text-sm text-slate-500">
          Les commentaires seront disponibles prochainement (sprint S1.5 du plan de développement).
        </p>
      </section>
    </div>
  );
}
