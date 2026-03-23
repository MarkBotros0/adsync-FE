'use client';

import { createContext, useContext } from 'react';
import type { Mention, MentionStats } from '@/lib/types';

export interface ContentDataCtx {
  /** All fetched mentions across all platforms, in memory. */
  mentions: Mention[];
  /** Aggregated stats for the full (unfiltered) dataset. */
  stats: MentionStats | null;
  /** True while the initial or reload fetch is in flight. */
  loading: boolean;
  /** True once data has been fetched at least once. */
  loaded: boolean;
  /** Trigger a fresh fetch from all platforms. */
  reload: () => void;
  /** Remove a single mention from the cached list (client-side only). */
  deleteMention: (id: string) => void;
}

export const ContentDataContext = createContext<ContentDataCtx>({
  mentions: [],
  stats: null,
  loading: false,
  loaded: false,
  reload: () => {},
  deleteMention: () => {},
});

export const useContentData = () => useContext(ContentDataContext);
