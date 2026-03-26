'use client';

import { useState, useMemo } from 'react';
import { RefreshCw } from 'lucide-react';
import { StatsBar } from '@/components/content/StatsBar';
import { MentionCard } from '@/components/content/MentionCard';
import { useFilters, getDateRange } from '@/contexts/filter-context';
import { useContentData } from '@/contexts/content-data-context';
import type { MentionStats } from '@/lib/types';

type SortMode = 'recent' | 'popular';

export default function MentionsPage() {
  const { selectedPlatforms, selectedSentiments, selectedEmotions, datePreset, customFrom, customTo } = useFilters();
  const { mentions, loading, reload, deleteMention } = useContentData();
  const [sort, setSort] = useState<SortMode>('recent');
  const [reloading, setReloading] = useState(false);

  const filtered = useMemo(() => {
    let list = [...mentions];

    const { from, to } = getDateRange(datePreset, customFrom, customTo);
    if (from) list = list.filter(m => new Date(m.created_at) >= from);
    if (to)   list = list.filter(m => new Date(m.created_at) <= to);

    if (selectedPlatforms.length > 0) {
      list = list.filter(m => selectedPlatforms.includes(m.platform));
    }
    if (selectedSentiments.length > 0) {
      list = list.filter(m => selectedSentiments.includes(m.sentiment));
    }
    if (selectedEmotions.length > 0) {
      list = list.filter(m => m.emotion && selectedEmotions.includes(m.emotion));
    }

    if (sort === 'popular') {
      list.sort((a, b) => b.interactions - a.interactions);
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }

    return list;
  }, [mentions, selectedPlatforms, selectedSentiments, selectedEmotions, sort, datePreset, customFrom, customTo]);

  const filteredStats = useMemo((): MentionStats => {
    const total_mentions = filtered.length;
    const total_reach = filtered.reduce((sum, m) => sum + (m.reach ?? 0), 0);
    const total_interactions = filtered.reduce((sum, m) => sum + (m.interactions ?? 0), 0);
    const negative_count = filtered.filter(m => m.sentiment === 'negative').length;
    const positive_count = filtered.filter(m => m.sentiment === 'positive').length;
    const neutral_count = filtered.filter(m => m.sentiment === 'neutral').length;
    const positive_percentage = total_mentions > 0 ? Math.round((positive_count / total_mentions) * 100) : 0;
    return { total_mentions, total_reach, total_interactions, negative_count, positive_count, neutral_count, positive_percentage };
  }, [filtered]);

  const handleReload = async () => {
    setReloading(true);
    reload();
    // Give the reload a moment to start before clearing the local spinner
    setTimeout(() => setReloading(false), 800);
  };

  const spinning = loading || reloading;

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <StatsBar stats={filteredStats} />

      {/* Mentions list header */}
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-5 py-2.5 flex items-center gap-4">
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => setSort('recent')}
            className={`font-medium transition-colors ${sort === 'recent' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-purple-400 hover:text-slate-700 dark:hover:text-purple-200'}`}
          >
            Recent first
          </button>
          <span className="text-slate-200 dark:text-dk-border">|</span>
          <button
            onClick={() => setSort('popular')}
            className={`font-medium transition-colors ${sort === 'popular' ? 'text-purple-700 dark:text-purple-300' : 'text-slate-500 dark:text-purple-400 hover:text-slate-700 dark:hover:text-purple-200'}`}
          >
            Popular first
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <button
            onClick={handleReload}
            disabled={spinning}
            className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium transition-colors disabled:opacity-60"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${spinning ? 'animate-spin' : ''}`} />
            Reload Data
          </button>
        </div>
      </div>

      {/* Loading */}
      {loading && (
        <div className="flex items-center justify-center py-10">
          <div className="w-6 h-6 rounded-full border-2 border-slate-200 border-t-purple-600 animate-spin" />
        </div>
      )}

      {/* Mentions list */}
      {!loading && (
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100 dark:divide-dk-border bg-white dark:bg-dk-bg">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-slate-700 dark:text-purple-200 mb-2">No content found</h3>
              <p className="text-sm text-slate-500 dark:text-purple-400">
                Try adjusting your filters or clearing them to see all content.
              </p>
            </div>
          ) : (
            filtered.map(mention => (
              <MentionCard
                key={mention.id}
                mention={mention}
                onDelete={deleteMention}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
