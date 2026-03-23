'use client';

import { createContext, useContext } from 'react';
import type { MentionPlatform, Sentiment, Emotion, FacebookPage, ConnectionStatuses } from '@/lib/types';

export type DatePreset = '7d' | '30d' | '3m' | '6m' | '1y' | 'all' | 'custom';

export const DATE_PRESETS: { key: DatePreset; label: string }[] = [
  { key: '7d',  label: 'Last 7 days'   },
  { key: '30d', label: 'Last 30 days'  },
  { key: '3m',  label: 'Last 3 months' },
  { key: '6m',  label: 'Last 6 months' },
  { key: '1y',  label: 'Last year'     },
  { key: 'all', label: 'All time'      },
];

export function getDateRange(
  preset: DatePreset,
  customFrom?: string | null,
  customTo?: string | null,
): { from: Date | null; to: Date | null } {
  if (preset === 'custom') {
    return {
      from: customFrom ? new Date(customFrom) : null,
      to:   customTo   ? new Date(customTo + 'T23:59:59') : null,
    };
  }
  const to = new Date();
  if (preset === 'all') return { from: null, to: null };
  const from = new Date();
  if (preset === '7d')  from.setDate(to.getDate() - 7);
  if (preset === '30d') from.setDate(to.getDate() - 30);
  if (preset === '3m')  from.setMonth(to.getMonth() - 3);
  if (preset === '6m')  from.setMonth(to.getMonth() - 6);
  if (preset === '1y')  from.setFullYear(to.getFullYear() - 1);
  return { from, to };
}

export interface FilterCtx {
  selectedPlatforms: MentionPlatform[];
  togglePlatform: (p: MentionPlatform) => void;
  selectedSentiments: Sentiment[];
  toggleSentiment: (s: Sentiment) => void;
  selectedEmotions: Emotion[];
  toggleEmotion: (e: Emotion) => void;
  datePreset: DatePreset;
  dateLabel: string;
  setDatePreset: (preset: DatePreset) => void;
  customFrom: string | null;
  customTo: string | null;
  setCustomFrom: (d: string | null) => void;
  setCustomTo: (d: string | null) => void;
  clearAll: () => void;
  sessionId: string | null;
  igSessionId: string | null;
  igUserId: string | null;
  ttSessionId: string | null;
  ttOpenId: string | null;
  connectionStatuses: ConnectionStatuses;
  setConnectionStatuses: (statuses: ConnectionStatuses) => void;
  refreshConnections: () => void;
  pages: FacebookPage[];
  selectedPage: FacebookPage | null;
  onPageSelect: (page: FacebookPage) => void;
  totalPosts: number;
  setTotalPosts: (n: number) => void;
  postsByPlatform: Partial<Record<MentionPlatform, number>>;
  setPostsByPlatform: (counts: Partial<Record<MentionPlatform, number>>) => void;
}

export const FilterContext = createContext<FilterCtx>({
  selectedPlatforms: [],
  togglePlatform: () => {},
  selectedSentiments: [],
  toggleSentiment: () => {},
  selectedEmotions: [],
  toggleEmotion: () => {},
  datePreset: 'all',
  dateLabel: 'All time',
  setDatePreset: () => {},
  customFrom: null,
  customTo: null,
  setCustomFrom: () => {},
  setCustomTo: () => {},
  clearAll: () => {},
  sessionId: null,
  igSessionId: null,
  igUserId: null,
  ttSessionId: null,
  ttOpenId: null,
  connectionStatuses: {
    facebook: { connected: false, user_name: null, loading: true },
    instagram: { connected: false, user_name: null, loading: true },
    tiktok: { connected: false, user_name: null, loading: true },
  },
  setConnectionStatuses: () => {},
  refreshConnections: () => {},
  pages: [],
  selectedPage: null,
  onPageSelect: () => {},
  totalPosts: 0,
  setTotalPosts: () => {},
  postsByPlatform: {},
  setPostsByPlatform: () => {},
});

export const useFilters = () => useContext(FilterContext);
