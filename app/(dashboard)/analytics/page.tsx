'use client';

import { useEffect, useState } from 'react';
import { StatsBar } from '@/components/content/StatsBar';
import { VolumeReachChart } from '@/components/charts/VolumeReachChart';
import { SentimentTimelineChart } from '@/components/charts/SentimentTimelineChart';
import { InteractionsChart } from '@/components/charts/InteractionsChart';
import { TopCountriesChart } from '@/components/charts/TopCountriesChart';
import { TrendingConversationsChart } from '@/components/charts/TrendingConversationsChart';
import { BestTimeHeatmap } from '@/components/charts/BestTimeHeatmap';
import { TrendingHashtagsChart } from '@/components/charts/TrendingHashtagsChart';
import { useFilters, getDateRange } from '@/contexts/filter-context';
import { pagesAPI } from '@/lib/api';
import type {
  MentionStats,
  VolumeDataPoint,
  InteractionDataPoint,
  SentimentDataPoint,
  TrendingHashtag,
  TrendingConversation,
  HeatmapCell,
} from '@/lib/types';

// ─── Transformations ──────────────────────────────────────────────────────────

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function postsToVolumeData(posts: any[]): VolumeDataPoint[] {
  const byDate: Record<string, { mentions: number; reach: number }> = {};
  posts.forEach(post => {
    const date = formatDate(post.created_time);
    if (!byDate[date]) byDate[date] = { mentions: 0, reach: 0 };
    byDate[date].mentions++;
    byDate[date].reach += post.engagement?.total ?? 0;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, v]) => ({ date, ...v }));
}

function postsToInteractionsData(posts: any[]): InteractionDataPoint[] {
  const byDate: Record<string, number> = {};
  posts.forEach(post => {
    const date = formatDate(post.created_time);
    byDate[date] = (byDate[date] ?? 0) + (post.engagement?.total ?? 0);
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, interactions]) => ({ date, interactions }));
}

function postsToSentimentData(posts: any[]): SentimentDataPoint[] {
  const byDate: Record<string, { positive: number; negative: number; neutral: number }> = {};
  posts.forEach(post => {
    const date = formatDate(post.created_time);
    if (!byDate[date]) byDate[date] = { positive: 0, negative: 0, neutral: 0 };
    byDate[date].neutral++;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, v]) => ({ date, ...v }));
}

const STOPWORDS = new Set([
  'the','a','an','and','or','but','in','on','at','to','for','of','with','by','from',
  'is','it','this','that','be','was','are','were','has','have','had','not','we','our',
  'you','your','my','i','he','she','they','them','their','us','me','him','her','its',
  'can','will','would','could','should','do','did','does','if','so','up','out','as',
  'all','new','get','got','just','now','more','also','than','then','how','what','when',
  'where','who','which','may','very','any','no','about','been','into','over','after',
  'its','re','ve','ll','am','im','dont','cant','wont','isnt','arent','wasnt','here',
]);

function extractKeywords(posts: any[]): TrendingConversation[] {
  const counts: Record<string, number> = {};
  posts.forEach(post => {
    const words = (post.message || '')
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 3 && !STOPWORDS.has(w));
    words.forEach((word: string) => {
      counts[word] = (counts[word] ?? 0) + 1;
    });
  });
  return Object.entries(counts)
    .filter(([, c]) => c > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 16)
    .map(([phrase, count]) => ({ phrase, count, sentiment: 'neutral' as const }));
}

function extractHashtags(posts: any[]): TrendingHashtag[] {
  const counts: Record<string, number> = {};
  posts.forEach(post => {
    const tags = (post.message || '').match(/#\w+/g) ?? [];
    tags.forEach((tag: string) => {
      const lower = tag.toLowerCase();
      counts[lower] = (counts[lower] ?? 0) + 1;
    });
  });
  return Object.entries(counts)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 10)
    .map(([hashtag, count]) => ({ hashtag, count, sentiment: 'neutral' as const }));
}

function postsToHeatmapData(posts: any[]): HeatmapCell[] {
  const cells: Record<string, number> = {};
  posts.forEach(post => {
    const d = new Date(post.created_time);
    const day = (d.getDay() + 6) % 7; // 0=Mon…6=Sun
    const hour = d.getHours();
    const key = `${day}_${hour}`;
    cells[key] = (cells[key] ?? 0) + 1;
  });
  const result: HeatmapCell[] = [];
  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      result.push({ day, hour, value: cells[`${day}_${hour}`] ?? 0 });
    }
  }
  return result;
}

function computeStats(posts: any[]): MentionStats {
  const totalInteractions = posts.reduce((s: number, p: any) => s + (p.engagement?.total ?? 0), 0);
  return {
    total_mentions: posts.length,
    total_reach: totalInteractions,
    total_interactions: totalInteractions,
    negative_count: 0,
    positive_count: 0,
    neutral_count: posts.length,
    positive_percentage: 0,
  };
}

// ─── Posts by platform ─────────────────────────────────────────────────────────
function InfluencersByMediaType({ totalFacebookPosts }: { totalFacebookPosts: number }) {
  const items = [
    { label: 'Facebook', count: totalFacebookPosts, color: 'bg-blue-600' },
    { label: 'Instagram', count: 0, color: 'bg-pink-500' },
    { label: 'X(Twitter)', count: 0, color: 'bg-black' },
    { label: 'YouTube', count: 0, color: 'bg-red-500' },
    { label: 'TikTok', count: 0, color: 'bg-gray-800' },
  ];
  const max = Math.max(1, ...items.map(i => i.count));

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Posts by Platform</h3>
      </div>
      <div className="p-5">
        <div className="flex items-end justify-center gap-4 h-40">
          {items.map(item => {
            const pct = (item.count / max) * 100;
            return (
              <div key={item.label} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-purple-200">{item.count}</span>
                <div
                  className={`w-full rounded-t-lg ${item.color} opacity-90`}
                  style={{ height: `${Math.max(4, pct)}%` }}
                />
                <span className="text-[10px] text-slate-500 dark:text-purple-400 text-center leading-tight">{item.label}</span>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const { sessionId, selectedPage, setTotalPosts, datePreset } = useFilters();
  const [stats, setStats] = useState<MentionStats | null>(null);
  const [volumeData, setVolumeData] = useState<VolumeDataPoint[] | undefined>(undefined);
  const [interactionsData, setInteractionsData] = useState<InteractionDataPoint[] | undefined>(undefined);
  const [sentimentData, setSentimentData] = useState<SentimentDataPoint[] | undefined>(undefined);
  const [hashtagsData, setHashtagsData] = useState<TrendingHashtag[] | undefined>(undefined);
  const [conversationsData, setConversationsData] = useState<TrendingConversation[] | undefined>(undefined);
  const [heatmapData, setHeatmapData] = useState<HeatmapCell[] | undefined>(undefined);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    if (!sessionId || !selectedPage) return;
    setLoading(true);
    pagesAPI.getPagePosts(selectedPage.id, sessionId, 100, selectedPage.access_token)
      .then(res => {
        const { from, to } = getDateRange(datePreset);
        const posts = (res.data.posts ?? []).filter((p: any) => {
          const d = new Date(p.created_time);
          if (from && d < from) return false;
          if (to   && d > to)   return false;
          return true;
        });
        const computed = computeStats(posts);
        setStats(computed);
        setTotalPosts(posts.length);
        setVolumeData(postsToVolumeData(posts));
        setInteractionsData(postsToInteractionsData(posts));
        setSentimentData(postsToSentimentData(posts));
        const tags = extractHashtags(posts);
        if (tags.length > 0) setHashtagsData(tags);
        const keywords = extractKeywords(posts);
        if (keywords.length > 0) setConversationsData(keywords);
        setHeatmapData(postsToHeatmapData(posts));
      })
      .catch(err => console.error('Failed to fetch posts for analytics:', err))
      .finally(() => setLoading(false));
  }, [sessionId, selectedPage, datePreset]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 dark:text-purple-400">
        <p className="text-sm">No data available. Connect a Facebook page to see analytics.</p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      {/* Stats bar */}
      <StatsBar stats={stats} />

      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-dk-bg">
        {/* Row 1: Volume + Sentiment */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <VolumeReachChart data={volumeData} />
          <SentimentTimelineChart data={sentimentData} />
        </div>

        {/* Row 2: Interactions */}
        <InteractionsChart data={interactionsData} />

        {/* Row 3: Trending Conversations */}
        <TrendingConversationsChart data={conversationsData} />

        {/* Row 4: Countries + Influencers by type */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TopCountriesChart data={undefined} />
          <InfluencersByMediaType totalFacebookPosts={stats.total_mentions} />
        </div>

        {/* Row 5: Heatmap */}
        <BestTimeHeatmap data={heatmapData} />

        {/* Row 6: Hashtags */}
        <TrendingHashtagsChart data={hashtagsData} />
      </div>
    </div>
  );
}
