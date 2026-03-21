'use client';

import { Download } from 'lucide-react';
import type { TrendingConversation } from '@/lib/types';

const SENTIMENT_DOT: Record<string, string> = {
  positive: 'bg-green-400',
  negative: 'bg-red-400',
  neutral:  'bg-slate-400',
};

export function TrendingConversationsChart({ data }: { data?: TrendingConversation[] }) {
  if (!data || data.length === 0) {
    return (
      <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
        <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Trending Conversations</h3>
          <button className="text-slate-400 dark:text-purple-500 hover:text-slate-600 dark:hover:text-purple-300">
            <Download className="h-4 w-4" />
          </button>
        </div>
        <div className="flex items-center justify-center py-16 text-slate-400 dark:text-purple-500 text-sm">
          Not enough post data to identify trending conversations
        </div>
      </div>
    );
  }

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Trending Conversations</h3>
        <div className="flex items-center gap-3">
          <div className="flex items-center gap-2 text-xs text-slate-500 dark:text-purple-400">
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-green-400 inline-block" /> Positive
            </span>
            <span className="flex items-center gap-1">
              <span className="h-2 w-2 rounded-full bg-red-400 inline-block" /> Negative
            </span>
            <button className="text-slate-400 dark:text-purple-500 hover:text-slate-600 dark:hover:text-purple-300 ml-1">Hide sentiment</button>
          </div>
          <button className="text-slate-400 dark:text-purple-500 hover:text-slate-600 dark:hover:text-purple-300">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-0">
        {/* Table */}
        <div className="p-5 border-r border-slate-100 dark:border-dk-border">
          <div className="flex items-center gap-2 text-xs text-slate-400 dark:text-purple-500 font-medium uppercase tracking-wide mb-3 px-1">
            <span className="flex-1">Context</span>
            <span>No. of uses</span>
          </div>
          <div className="space-y-1">
            {data.map((c, i) => (
              <div
                key={c.phrase}
                className="flex items-center gap-2 px-1 py-1.5 rounded-lg hover:bg-slate-50 dark:hover:bg-dk-raised transition-colors"
              >
                <span className="text-xs text-slate-400 dark:text-purple-500 w-5 shrink-0">{i + 1}.</span>
                <span className={`h-2 w-2 rounded-full shrink-0 ${c.sentiment ? SENTIMENT_DOT[c.sentiment] : 'bg-slate-300'}`} />
                <span className="text-sm text-slate-700 dark:text-purple-200 flex-1 truncate">{c.phrase}</span>
                <span className="text-sm font-semibold text-slate-900 dark:text-purple-100">{c.count}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Word cloud */}
        <div className="p-5 flex items-center justify-center">
          <div className="relative w-full h-60 flex flex-wrap items-center justify-center gap-2 overflow-hidden">
            {data.map((c) => {
              const max = data[0]?.count ?? 1;
              const size = Math.max(11, Math.min(22, 11 + (c.count / max) * 11));
              const color = c.sentiment === 'negative'
                ? '#ef4444'
                : c.sentiment === 'positive'
                  ? '#22c55e'
                  : '#a78bfa';
              return (
                <span
                  key={c.phrase}
                  className="cursor-pointer hover:opacity-70 transition-opacity"
                  style={{ fontSize: size, color, fontWeight: size > 16 ? 700 : 500 }}
                >
                  {c.phrase}
                </span>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}
