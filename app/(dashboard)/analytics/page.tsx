'use client';

import { useMemo, useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { StatsBar } from '@/components/content/StatsBar';
import { VolumeReachChart } from '@/components/charts/VolumeReachChart';
import { SentimentTimelineChart } from '@/components/charts/SentimentTimelineChart';
import { InteractionsChart } from '@/components/charts/InteractionsChart';
import { TopCountriesChart } from '@/components/charts/TopCountriesChart';
import { TrendingConversationsChart } from '@/components/charts/TrendingConversationsChart';
import { BestTimeHeatmap } from '@/components/charts/BestTimeHeatmap';
import { TrendingHashtagsChart } from '@/components/charts/TrendingHashtagsChart';
import { useFilters, getDateRange } from '@/contexts/filter-context';
import { useContentData } from '@/contexts/content-data-context';
import type {
  Mention,
  MentionPlatform,
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

function mentionsToVolumeData(mentions: Mention[]): VolumeDataPoint[] {
  const byDate: Record<string, { mentions: number; reach: number }> = {};
  mentions.forEach(m => {
    const date = formatDate(m.created_at);
    if (!byDate[date]) byDate[date] = { mentions: 0, reach: 0 };
    byDate[date].mentions++;
    byDate[date].reach += m.reach;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, v]) => ({ date, ...v }));
}

function mentionsToInteractionsData(mentions: Mention[]): InteractionDataPoint[] {
  const byDate: Record<string, number> = {};
  mentions.forEach(m => {
    const date = formatDate(m.created_at);
    byDate[date] = (byDate[date] ?? 0) + m.interactions;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, interactions]) => ({ date, interactions }));
}

function mentionsToSentimentData(mentions: Mention[]): SentimentDataPoint[] {
  const byDate: Record<string, { positive: number; negative: number; neutral: number }> = {};
  mentions.forEach(m => {
    const date = formatDate(m.created_at);
    if (!byDate[date]) byDate[date] = { positive: 0, negative: 0, neutral: 0 };
    byDate[date][m.sentiment]++;
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

function extractKeywords(mentions: Mention[]): TrendingConversation[] {
  const counts: Record<string, number> = {};
  mentions.forEach(m => {
    const words = (m.content || '')
      .toLowerCase()
      .replace(/https?:\/\/\S+/g, '')
      .replace(/[^a-z0-9\s]/g, ' ')
      .split(/\s+/)
      .filter((w: string) => w.length > 3 && !STOPWORDS.has(w));
    words.forEach((word: string) => { counts[word] = (counts[word] ?? 0) + 1; });
  });
  return Object.entries(counts)
    .filter(([, c]) => c > 1)
    .sort(([, a], [, b]) => b - a)
    .slice(0, 16)
    .map(([phrase, count]) => ({ phrase, count, sentiment: 'neutral' as const }));
}

function extractHashtags(mentions: Mention[]): TrendingHashtag[] {
  const counts: Record<string, number> = {};
  mentions.forEach(m => {
    const tags = m.hashtags ?? (m.content || '').match(/#\w+/g) ?? [];
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

function mentionsToHeatmapData(mentions: Mention[]): HeatmapCell[] {
  const cells: Record<string, number> = {};
  mentions.forEach(m => {
    const d = new Date(m.created_at);
    const day = (d.getDay() + 6) % 7;
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

function computeStats(mentions: Mention[]): MentionStats {
  return {
    total_mentions: mentions.length,
    total_reach: mentions.reduce((s, m) => s + m.reach, 0),
    total_interactions: mentions.reduce((s, m) => s + m.interactions, 0),
    negative_count: mentions.filter(m => m.sentiment === 'negative').length,
    positive_count: mentions.filter(m => m.sentiment === 'positive').length,
    neutral_count: mentions.filter(m => m.sentiment === 'neutral').length,
    positive_percentage: mentions.length
      ? Math.round((mentions.filter(m => m.sentiment === 'positive').length / mentions.length) * 100)
      : 0,
  };
}

// ─── Posts by platform chart ───────────────────────────────────────────────────

const PLATFORM_COLORS: Partial<Record<MentionPlatform, string>> = {
  facebook:  'bg-blue-600',
  instagram: 'bg-pink-500',
  tiktok:    'bg-gray-800',
  twitter:   'bg-black',
  youtube:   'bg-red-500',
  linkedin:  'bg-blue-700',
};

function PostsByPlatform({ mentions }: { mentions: Mention[] }) {
  const counts: Partial<Record<MentionPlatform, number>> = {};
  mentions.forEach(m => { counts[m.platform] = (counts[m.platform] ?? 0) + 1; });

  const items = (Object.entries(counts) as [MentionPlatform, number][])
    .sort(([, a], [, b]) => b - a);
  const max = Math.max(1, ...items.map(([, c]) => c));

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Posts by Platform</h3>
      </div>
      <div className="p-5">
        <div className="flex items-end justify-center gap-4 h-40">
          {items.map(([platform, count]) => {
            const pct = (count / max) * 100;
            return (
              <div key={platform} className="flex flex-col items-center gap-1 flex-1">
                <span className="text-xs font-semibold text-slate-700 dark:text-purple-200">{count}</span>
                <div
                  className={`w-full rounded-t-lg ${PLATFORM_COLORS[platform] ?? 'bg-slate-400'} opacity-90`}
                  style={{ height: `${Math.max(4, pct)}%` }}
                />
                <span className="text-[10px] text-slate-500 dark:text-purple-400 text-center leading-tight capitalize">{platform}</span>
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
  const {
    datePreset, customFrom, customTo,
    selectedPlatforms, selectedSentiments, selectedEmotions,
  } = useFilters();
  const { mentions: allMentions, loading, reload } = useContentData();
  const [reloading, setReloading] = useState(false);

  const handleReload = () => {
    setReloading(true);
    reload();
    setTimeout(() => setReloading(false), 800);
  };

  const spinning = loading || reloading;

  const filtered = useMemo(() => {
    const { from, to } = getDateRange(datePreset, customFrom, customTo);
    return allMentions.filter(m => {
      const d = new Date(m.created_at);
      if (from && d < from) return false;
      if (to   && d > to)   return false;
      if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(m.platform)) return false;
      if (selectedSentiments.length > 0 && !selectedSentiments.includes(m.sentiment)) return false;
      if (selectedEmotions.length > 0 && (!m.emotion || !selectedEmotions.includes(m.emotion))) return false;
      return true;
    });
  }, [allMentions, datePreset, customFrom, customTo, selectedPlatforms, selectedSentiments, selectedEmotions]);

  const stats     = useMemo(() => filtered.length > 0 ? computeStats(filtered) : null, [filtered]);
  const volumeData        = useMemo(() => mentionsToVolumeData(filtered), [filtered]);
  const interactionsData  = useMemo(() => mentionsToInteractionsData(filtered), [filtered]);
  const sentimentData     = useMemo(() => mentionsToSentimentData(filtered), [filtered]);
  const hashtagsData      = useMemo(() => { const t = extractHashtags(filtered); return t.length > 0 ? t : undefined; }, [filtered]);
  const conversationsData = useMemo(() => { const k = extractKeywords(filtered); return k.length > 0 ? k : undefined; }, [filtered]);
  const heatmapData       = useMemo(() => mentionsToHeatmapData(filtered), [filtered]);

  if (loading) {
    return (
      <div className="flex items-center justify-center h-full">
        <div className="w-8 h-8 rounded-full border-4 border-slate-200 border-t-purple-600 animate-spin" />
      </div>
    );
  }

  if (!stats) {
    const hasConnectedData = allMentions.length > 0;
    return (
      <div className="flex flex-col items-center justify-center h-full gap-3 text-slate-500 dark:text-purple-400">
        <p className="text-sm">
          {hasConnectedData
            ? 'No data matches the current filters.'
            : 'No data available. Connect a platform to see analytics.'}
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col h-full">
      <StatsBar stats={stats} />

      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-5 py-2.5 flex items-center">
        <div className="ml-auto">
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

      <div className="flex-1 overflow-y-auto p-5 space-y-5 bg-slate-50 dark:bg-dk-bg">
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <VolumeReachChart data={volumeData} />
          <SentimentTimelineChart data={sentimentData} />
        </div>

        <InteractionsChart data={interactionsData} />

        <TrendingConversationsChart data={conversationsData} />

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
          <TopCountriesChart data={undefined} />
          <PostsByPlatform mentions={filtered} />
        </div>

        <BestTimeHeatmap data={heatmapData} />

        <TrendingHashtagsChart data={hashtagsData} />
      </div>
    </div>
  );
}
