'use client';

import { useState, useMemo, useEffect } from 'react';
import { RefreshCw } from 'lucide-react';
import { StatsBar } from '@/components/mentions/StatsBar';
import { MentionCard } from '@/components/mentions/MentionCard';
import { useFilters, getDateRange } from '@/contexts/filter-context';
import { pagesAPI } from '@/lib/api';
import type { Mention, MentionStats } from '@/lib/types';

type SortMode = 'recent' | 'popular';

function postsToMentions(posts: any[], pageName: string): Mention[] {
  return posts
    .filter(post => post.message || post.story)
    .map(post => {
      const hashtags = (post.message || '').match(/#\w+/g) ?? [];
      const total = post.engagement?.total ?? 0;
      return {
        id: post.id,
        platform: 'facebook' as const,
        author: {
          name: pageName,
          username: `@${pageName.toLowerCase().replace(/\s+/g, '')}`,
          followers: 0,
        },
        content: post.message || post.story || '',
        url: post.permalink_url || '#',
        created_at: post.created_time,
        sentiment: 'neutral' as const,
        reach: (post.engagement?.reactions ?? 0) * 10,
        interactions: total,
        performance: Math.min(10, Math.max(1, Math.ceil(total / 5))),
        language: 'en',
        hashtags: hashtags.length > 0 ? hashtags : undefined,
      };
    });
}

function computeStats(mentions: Mention[]): MentionStats {
  const totalInteractions = mentions.reduce((s, m) => s + m.interactions, 0);
  const totalReach = mentions.reduce((s, m) => s + m.reach, 0);
  return {
    total_mentions: mentions.length,
    total_reach: totalReach,
    total_interactions: totalInteractions,
    negative_count: 0,
    positive_count: 0,
    neutral_count: mentions.length,
    positive_percentage: 0,
  };
}

export default function MentionsPage() {
  const { selectedPlatforms, selectedSentiments, selectedEmotions, sessionId, selectedPage, setTotalPosts, datePreset } = useFilters();
  const [sort, setSort] = useState<SortMode>('recent');
  const [mentions, setMentions] = useState<Mention[]>([]);
  const [stats, setStats] = useState<MentionStats | null>(null);
  const [loading, setLoading] = useState(false);
  const [updating, setUpdating] = useState(false);

  const fetchPosts = async (session: string, page: { id: string; access_token: string; name: string }) => {
    try {
      const res = await pagesAPI.getPagePosts(page.id, session, 50, page.access_token);
      const posts = res.data.posts ?? [];
      if (posts.length > 0) {
        const transformed = postsToMentions(posts, page.name);
        setMentions(transformed);
        setStats(computeStats(transformed));
        setTotalPosts(transformed.length);
      }
    } catch (err) {
      console.error('Failed to fetch posts for mentions:', err);
    }
  };

  useEffect(() => {
    if (!sessionId || !selectedPage) return;
    setLoading(true);
    fetchPosts(sessionId, selectedPage).finally(() => setLoading(false));
  }, [sessionId, selectedPage]);

  const filtered = useMemo(() => {
    let list = [...mentions];

    const { from, to } = getDateRange(datePreset);
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
  }, [mentions, selectedPlatforms, selectedSentiments, selectedEmotions, sort, datePreset]);

  const handleDelete = (id: string) => {
    setMentions(prev => prev.filter(m => m.id !== id));
  };

  const handleUpdate = async () => {
    if (!sessionId || !selectedPage) {
      setUpdating(true);
      setTimeout(() => setUpdating(false), 1200);
      return;
    }
    setUpdating(true);
    await fetchPosts(sessionId, selectedPage).catch(() => {});
    setUpdating(false);
  };

  const emptyStats: MentionStats = {
    total_mentions: 0, total_reach: 0, total_interactions: 0,
    negative_count: 0, positive_count: 0, neutral_count: 0, positive_percentage: 0,
  };

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <StatsBar stats={stats ?? emptyStats} />

      {/* Mentions list header */}
      <div className="bg-white border-b border-slate-200 px-5 py-2.5 flex items-center gap-4">
        <div className="flex items-center gap-3 text-sm">
          <button
            onClick={() => setSort('recent')}
            className={`font-medium transition-colors ${sort === 'recent' ? 'text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Recent first
          </button>
          <span className="text-slate-200">|</span>
          <button
            onClick={() => setSort('popular')}
            className={`font-medium transition-colors ${sort === 'popular' ? 'text-purple-700' : 'text-slate-500 hover:text-slate-700'}`}
          >
            Popular first
          </button>
        </div>

        <div className="ml-auto flex items-center gap-3">
          <span className="text-xs text-slate-400">
            {selectedPage ? `${selectedPage.name} · Facebook` : 'Demo data'}
          </span>
          <button
            onClick={handleUpdate}
            className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium transition-colors"
          >
            <RefreshCw className={`h-3.5 w-3.5 ${updating || loading ? 'animate-spin' : ''}`} />
            Update Data
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
        <div className="flex-1 overflow-y-auto divide-y divide-slate-100">
          {filtered.length === 0 ? (
            <div className="flex flex-col items-center justify-center py-20 text-center px-6">
              <div className="text-4xl mb-4">📭</div>
              <h3 className="text-lg font-semibold text-slate-700 mb-2">No mentions found</h3>
              <p className="text-sm text-slate-500">
                Try adjusting your filters or clearing them to see all mentions.
              </p>
            </div>
          ) : (
            filtered.map(mention => (
              <MentionCard
                key={mention.id}
                mention={mention}
                onDelete={handleDelete}
              />
            ))
          )}
        </div>
      )}
    </div>
  );
}
