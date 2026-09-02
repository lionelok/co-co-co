import Link from 'next/link';
import { Badge, ScoreBadge } from '@co-co-co/ui';
import type { Campaign } from '@co-co-co/types';
import { CAMPAIGN_STATUS_LABELS, CAMPAIGN_STATUS_TONES } from '@/lib/campaign-status';

export function CampaignCard({ campaign }: { campaign: Campaign }) {
  return (
    <Link
      href={`/campagnes/${campaign.slug}`}
      className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-5 transition-shadow hover:shadow-md"
    >
      <div className="flex items-center justify-between gap-2">
        <Badge tone={CAMPAIGN_STATUS_TONES[campaign.status]}>
          {CAMPAIGN_STATUS_LABELS[campaign.status]}
        </Badge>
        <span className="text-xs font-medium uppercase tracking-wide text-slate-400">
          {campaign.entityName}
        </span>
      </div>
      <h3 className="text-lg font-semibold text-slate-900">{campaign.title}</h3>
      <p className="line-clamp-2 text-sm text-slate-600">{campaign.summary}</p>
      <div className="mt-auto pt-2">
        <ScoreBadge score={campaign.averageScore} voteCount={campaign.voteCount} />
      </div>
    </Link>
  );
}
