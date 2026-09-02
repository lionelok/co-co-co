import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import { CampaignCard } from '@/components/campaign-card';
import { categories, getCampaignsByCategory, getCategoryBySlug, sectors } from '@/lib/mock-data';

type CategoryPageProps = {
  params: Promise<{ slug: string }>;
};

export function generateStaticParams() {
  return categories.map((category) => ({ slug: category.slug }));
}

export async function generateMetadata({ params }: CategoryPageProps): Promise<Metadata> {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    return {};
  }

  return {
    title: category.name,
    description: category.description,
  };
}

export default async function CategoryPage({ params }: CategoryPageProps) {
  const { slug } = await params;
  const category = getCategoryBySlug(slug);

  if (!category) {
    notFound();
  }

  const sector = sectors.find((s) => s.id === category.sectorId);
  const campaignsInCategory = getCampaignsByCategory(category.id);

  return (
    <div className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
      <p className="text-sm font-medium uppercase tracking-wide text-slate-500">{sector?.name}</p>
      <h1 className="mt-1 text-3xl font-bold text-slate-900">{category.name}</h1>
      <p className="mt-2 max-w-2xl text-slate-600">{category.description}</p>

      <div className="mt-8">
        {campaignsInCategory.length === 0 ? (
          <p className="text-slate-500">
            Aucune campagne dans cette catégorie pour l&apos;instant.
          </p>
        ) : (
          <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {campaignsInCategory.map((campaign) => (
              <CampaignCard key={campaign.id} campaign={campaign} />
            ))}
          </div>
        )}
      </div>
    </div>
  );
}
