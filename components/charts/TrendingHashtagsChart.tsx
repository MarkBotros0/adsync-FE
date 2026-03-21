'use client';

import { TRENDING_HASHTAGS } from '@/lib/mock-data';
import type { TrendingHashtag } from '@/lib/types';

const SENTIMENT_DOT: Record<string, string> = {
  positive: 'bg-green-400',
  negative: 'bg-red-400',
  neutral:  'bg-slate-400',
};

export function TrendingHashtagsChart({ data }: { data?: TrendingHashtag[] }) {
  const hashtags = data ?? TRENDING_HASHTAGS;
  const max = hashtags[0]?.count ?? 1;

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Trending Hashtags</h3>
        <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-purple-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400 inline-block" /> Positive
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Negative
            </span>
          </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-purple-500 font-medium uppercase tracking-wide mb-3 px-1">
          <span className="flex-1">Hashtag</span>
          <span>No. of uses</span>
        </div>
        <div className="space-y-2">
          {hashtags.map((h, i) => (
            <div key={h.hashtag} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 dark:text-purple-500 w-4 shrink-0">{i + 1}.</span>
              <span className={`h-2 w-2 rounded-full shrink-0 ${h.sentiment ? SENTIMENT_DOT[h.sentiment] : 'bg-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-purple-600 dark:text-purple-400 font-medium">{h.hashtag}</span>
                  <span className="text-sm font-semibold text-slate-900 dark:text-purple-100">{h.count}</span>
                </div>
                <div className="h-1 bg-slate-100 dark:bg-dk-raised rounded-full overflow-hidden">
                  <div
                    className="h-full bg-purple-400 rounded-full"
                    style={{ width: `${(h.count / max) * 100}%` }}
                  />
                </div>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
