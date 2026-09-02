import type { BadgeTone } from '@co-co-co/ui';
import type { CampaignStatus } from '@co-co-co/types';

export const CAMPAIGN_STATUS_LABELS: Record<CampaignStatus, string> = {
  draft: 'Brouillon',
  configuration: 'En configuration',
  scheduled: 'À venir',
  active: 'Vote en cours',
  closed: 'Clôturée',
  report_published: 'Rapport publié',
  petition: 'Pétition en cours',
  archived: 'Archivée',
};

export const CAMPAIGN_STATUS_TONES: Record<CampaignStatus, BadgeTone> = {
  draft: 'neutral',
  configuration: 'neutral',
  scheduled: 'info',
  active: 'success',
  closed: 'neutral',
  report_published: 'info',
  petition: 'warning',
  archived: 'neutral',
};
