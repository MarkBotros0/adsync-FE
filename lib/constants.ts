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
