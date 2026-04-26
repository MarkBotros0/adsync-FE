export const PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
} as const;

export const DATE_RANGES = {
  LAST_7_DAYS: { days: 7, label: 'Last 7 days' },
  LAST_30_DAYS: { days: 30, label: 'Last 30 days' },
  LAST_90_DAYS: { days: 90, label: 'Last 90 days' },
} as const;

export const CHART_COLORS = {
  primary: '#3b82f6',
  success: '#10b981',
  warning: '#f59e0b',
  danger: '#ef4444',
  purple: '#8b5cf6',
  pink: '#ec4899',
} as const;

export const METRIC_ICONS = {
  FOLLOWERS: 'Users',
  ENGAGEMENT: 'Heart',
  IMPRESSIONS: 'Eye',
  REACH: 'TrendingUp',
  CLICKS: 'MousePointer',
  CONVERSIONS: 'Target',
} as const;

// ─── Competitor Analysis ──────────────────────────────────────────────────────

export const COMPETITOR_ACTOR_KEYS = [
  'facebook_ads',
  'instagram',
  'tiktok',
  'google_search',
  'website',
  'google_places',
] as const;

export const COMPETITOR_ACTOR_LABELS = {
  facebook_ads:   'Meta Ads',
  instagram:      'Instagram',
  tiktok:         'TikTok',
  google_search:  'Google SERP',
  website:        'Website',
  google_places:  'Places',
} as const;

export const COMPETITOR_ACTOR_DESCRIPTIONS = {
  facebook_ads:   'Active ads from Meta Ad Library (Facebook + Instagram)',
  instagram:      'Profile + recent posts pulled directly from Instagram',
  tiktok:         'Profile + recent videos pulled directly from TikTok',
  google_search:  'Top organic results for the configured query',
  website:        'Crawl of the configured website URL',
  google_places:  'Google Maps locations + recent reviews',
} as const;

/** Subset of actors that get pandas-backed summary cards (Meta, IG, TT). */
export const COMPETITOR_PANDAS_ACTORS: ReadonlyArray<'facebook_ads' | 'instagram' | 'tiktok'> = [
  'facebook_ads',
  'instagram',
  'tiktok',
] as const;

export const COMPETITOR_JOB_STATUS_LABELS = {
  pending:    'Queued',
  running:    'Scraping…',
  completed:  'Up to date',
  partial:    'Partial',
  failed:     'Failed',
} as const;

export const COMPETITOR_JOB_POLL_INTERVAL_MS = 6000;
/** Hard ceiling on how long the frontend will keep polling a job. */
export const COMPETITOR_JOB_POLL_MAX_DURATION_MS = 5 * 60 * 1000;
