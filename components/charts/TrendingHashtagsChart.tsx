'use client';

import { Download } from 'lucide-react';
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
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Trending Hashtags</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400 inline-block" /> Positive
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Negative
            </span>
            <button className="text-slate-400 hover:text-slate-600 ml-1">Hide sentiment</button>
          </div>
          <button className="text-slate-400 hover:text-slate-600">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <div className="flex items-center gap-2 text-xs text-slate-400 font-medium uppercase tracking-wide mb-3 px-1">
          <span className="flex-1">Hashtag</span>
          <span>No. of uses</span>
        </div>
        <div className="space-y-2">
          {hashtags.map((h, i) => (
            <div key={h.hashtag} className="flex items-center gap-2">
              <span className="text-xs text-slate-400 w-4 shrink-0">{i + 1}.</span>
              <span className={`h-2 w-2 rounded-full shrink-0 ${h.sentiment ? SENTIMENT_DOT[h.sentiment] : 'bg-slate-300'}`} />
              <div className="flex-1 min-w-0">
                <div className="flex items-center justify-between mb-1">
                  <span className="text-sm text-purple-600 font-medium">{h.hashtag}</span>
                  <span className="text-sm font-semibold text-slate-900">{h.count}</span>
                </div>
                <div className="h-1 bg-slate-100 rounded-full overflow-hidden">
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
