'use client';

import { useEffect, useMemo, useState } from 'react';
import { Plug, RefreshCw, SlidersHorizontal } from 'lucide-react';
import { StatsBar } from '@/components/content/StatsBar';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';
import { EchofoldSpinner } from '@/components/brand/echofold-spinner';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { VolumeReachChart } from '@/components/charts/VolumeReachChart';
import { SentimentTimelineChart } from '@/components/charts/SentimentTimelineChart';
import { InteractionsChart } from '@/components/charts/InteractionsChart';
import { TopCountriesChart } from '@/components/charts/TopCountriesChart';
import { TrendingConversationsChart } from '@/components/charts/TrendingConversationsChart';
import { BestTimeHeatmap } from '@/components/charts/BestTimeHeatmap';
import { TrendingHashtagsChart } from '@/components/charts/TrendingHashtagsChart';
import { PostFormatChart } from '@/components/charts/PostFormatChart';
import { FollowersGrowthChart } from '@/components/charts/FollowersGrowthChart';
import { PeriodOverPeriodCard } from '@/components/charts/PeriodOverPeriodCard';
import { GradeDistributionChart } from '@/components/charts/GradeDistributionChart';
import { AudienceGenderChart } from '@/components/charts/AudienceGenderChart';
import { AudienceAgeChart } from '@/components/charts/AudienceAgeChart';
import { HashtagPerformanceTable } from '@/components/charts/HashtagPerformanceTable';
import { useFilters, getDateRange } from '@/contexts/filter-context';
import { useContentData } from '@/contexts/content-data-context';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { analyticsAPI } from '@/lib/api';
import type {
  AnalyticsOverviewData,
  Mention,
  MentionPlatform,
  MentionStats,
  VolumeDataPoint,
  InteractionDataPoint,
  SentimentDataPoint,
  TrendingHashtag,
  TrendingConversation,
  HeatmapCell,
  PostFormatDataPoint,
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
  const byDate: Record<string, { interactions: number; reach: number }> = {};
  mentions.forEach(m => {
    const date = formatDate(m.created_at);
    if (!byDate[date]) byDate[date] = { interactions: 0, reach: 0 };
    byDate[date].interactions += m.interactions;
    byDate[date].reach += m.reach;
  });
  return Object.entries(byDate)
    .sort(([a], [b]) => new Date(a).getTime() - new Date(b).getTime())
    .map(([date, v]) => ({ date, ...v }));
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

function mentionsToPostFormatData(mentions: Mention[]): PostFormatDataPoint[] {
  const byFormat: Record<string, { interactions: number; reach: number; count: number }> = {};
  mentions.forEach(m => {
    const format = m.post_format ?? 'Post';
    if (!byFormat[format]) byFormat[format] = { interactions: 0, reach: 0, count: 0 };
    byFormat[format].interactions += m.interactions;
    byFormat[format].reach += m.reach;
    byFormat[format].count++;
  });
  return Object.entries(byFormat).map(([format, v]) => ({ format, ...v }));
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

// ─── Section header ────────────────────────────────────────────────────────────

function SectionTitle({ children }: { children: React.ReactNode }) {
  return (
    <h2 className="text-xs font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
      {children}
    </h2>
  );
}

function ChartCard({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-dk-border dark:bg-dk-surface">
      <h3 className="mb-3 text-sm font-semibold text-slate-800 dark:text-purple-100">{title}</h3>
      {children}
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function AnalyticsPage() {
  const {
    datePreset, customFrom, customTo,
    selectedPlatforms, selectedSentiments, selectedEmotions,
    igSessionId,
  } = useFilters();
  const { mentions: allMentions, loading, reload } = useContentData();
  const { token } = useBrandAuthContext();
  const [reloading, setReloading] = useState(false);
  const [activeTab, setActiveTab] = useState('overview');

  // Marketing-expert overview KPIs (computed server-side from the visible posts).
  const [overview, setOverview] = useState<AnalyticsOverviewData | null>(null);
  const [audience, setAudience] = useState<{
    gender: { female: number; male: number; unspecified: number };
    age: Record<string, number>;
  } | null>(null);

  const handleReload = () => {
    setReloading(true);
    reload();
    setTimeout(() => setReloading(false), 800);
  };

  const spinning = loading || reloading;

  const { from: dateFrom, to: dateTo } = useMemo(
    () => getDateRange(datePreset, customFrom, customTo),
    [datePreset, customFrom, customTo],
  );

  const filtered = useMemo(() => {
    return allMentions.filter(m => {
      const d = new Date(m.created_at);
      if (dateFrom && d < dateFrom) return false;
      if (dateTo   && d > dateTo)   return false;
      if (selectedPlatforms.length > 0 && !selectedPlatforms.includes(m.platform)) return false;
      if (selectedSentiments.length > 0 && !selectedSentiments.includes(m.sentiment)) return false;
      if (selectedEmotions.length > 0 && (!m.emotion || !selectedEmotions.includes(m.emotion))) return false;
      return true;
    });
  }, [allMentions, dateFrom, dateTo, selectedPlatforms, selectedSentiments, selectedEmotions]);

  // Fetch the marketing-expert KPI overview whenever the visible post set changes.
  useEffect(() => {
    if (!token || filtered.length === 0) {
      setOverview(null);
      return;
    }
    let cancelled = false;
    analyticsAPI
      .overview(token, filtered as unknown as Record<string, unknown>[])
      .then(res => {
        if (!cancelled) setOverview(res.data.data as AnalyticsOverviewData);
      })
      .catch(() => { /* silent — KPI tiles hide if missing */ });
    return () => { cancelled = true; };
  }, [token, filtered]);

  // Fetch IG audience demographics once per session for the Audience tab.
  useEffect(() => {
    if (!token) return;
    let cancelled = false;
    Promise.all([
      analyticsAPI.audienceGender(token).catch(() => null),
      analyticsAPI.audienceAge(token).catch(() => null),
    ]).then(([g, a]) => {
      if (cancelled) return;
      setAudience({
        gender: g?.data.data ?? { female: 0, male: 0, unspecified: 0 },
        age: a?.data.data ?? {},
      });
    });
    return () => { cancelled = true; };
  }, [token]);

  const igSince = dateFrom ? Math.floor(dateFrom.getTime() / 1000).toString() : undefined;
  const igUntil = dateTo   ? Math.floor(dateTo.getTime()   / 1000).toString() : undefined;

  const stats             = useMemo(() => filtered.length > 0 ? computeStats(filtered) : null, [filtered]);
  const volumeData        = useMemo(() => mentionsToVolumeData(filtered), [filtered]);
  const interactionsData  = useMemo(() => mentionsToInteractionsData(filtered), [filtered]);
  const sentimentData     = useMemo(() => mentionsToSentimentData(filtered), [filtered]);
  const postFormatData    = useMemo(() => mentionsToPostFormatData(filtered), [filtered]);
  const hashtagsData      = useMemo(() => { const t = extractHashtags(filtered); return t.length > 0 ? t : undefined; }, [filtered]);
  const conversationsData = useMemo(() => { const k = extractKeywords(filtered); return k.length > 0 ? k : undefined; }, [filtered]);
  const heatmapData       = useMemo(() => mentionsToHeatmapData(filtered), [filtered]);

  if (loading) {
    return (
      <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-dk-bg">
        <EchofoldSpinner size="md" label="Building your analytics" />
      </div>
    );
  }

  if (!stats) {
    const hasConnectedData = allMentions.length > 0;
    return hasConnectedData ? (
      <EchofoldEmptyState
        icon={SlidersHorizontal}
        title="No data matches your filters"
        description="Adjust the date range, platform, sentiment, or emotion filters to bring data back into view."
        className="h-full"
      />
    ) : (
      <EchofoldEmptyState
        icon={Plug}
        badge="Get started"
        title="Connect a platform to see analytics"
        description="Echofold builds your charts, sentiment timeline, and trending topics from real platform data — connect Facebook, Instagram, or TikTok to get rolling."
        className="h-full"
      />
    );
  }

  const top = overview?.top_of_page;

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

        {/* ── Top-of-page KPI tiles (marketing-expert spec) ── */}
        <section className="space-y-3">
          <SectionTitle>Headline KPIs · last {Math.max(1, Math.round(((dateTo?.getTime() ?? Date.now()) - (dateFrom?.getTime() ?? Date.now())) / 86400000))} days</SectionTitle>
          <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
            <PeriodOverPeriodCard
              label="Followers Growth"
              value={top?.followers_growth_rate_pct == null ? '—' : top.followers_growth_rate_pct.toFixed(2)}
              unit={top?.followers_growth_rate_pct == null ? '' : '%'}
              hideDelta
            />
            <PeriodOverPeriodCard
              label="ER per Reach"
              value={overview?.engagement_rate_per_reach_pct == null ? '—' : overview.engagement_rate_per_reach_pct.toFixed(2)}
              unit={overview?.engagement_rate_per_reach_pct == null ? '' : '%'}
              hideDelta
            />
            <PeriodOverPeriodCard
              label="Interactions / 1k Followers"
              value={overview?.interactions_per_1k_followers == null ? '—' : overview.interactions_per_1k_followers.toFixed(2)}
              hideDelta
            />
            <PeriodOverPeriodCard
              label="Avg Reach / Post"
              value={top?.avg_reach_per_post == null ? '—' : Math.round(top.avg_reach_per_post).toLocaleString()}
              hideDelta
            />
            <PeriodOverPeriodCard
              label="Avg Saves / Post"
              value={top?.avg_saves_per_post == null ? '—' : top.avg_saves_per_post.toFixed(1)}
              hideDelta
            />
            <PeriodOverPeriodCard
              label="Avg Shares / Post"
              value={top?.avg_shares_per_post == null ? '—' : top.avg_shares_per_post.toFixed(1)}
              hideDelta
            />
          </div>
        </section>

        {/* ── Tabs ── */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-5">
          <TabsList className="overflow-x-auto whitespace-nowrap">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="audience">Audience</TabsTrigger>
            <TabsTrigger value="content">Content</TabsTrigger>
            <TabsTrigger value="hashtags">Hashtags</TabsTrigger>
            <TabsTrigger value="grade">Post Grade</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-5">
            <VolumeReachChart data={volumeData} />
            <InteractionsChart data={interactionsData} />
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <PostFormatChart data={postFormatData} />
              <FollowersGrowthChart igSessionId={igSessionId} since={igSince} until={igUntil} />
            </div>
            <SentimentTimelineChart data={sentimentData} />
            <TrendingConversationsChart data={conversationsData} />
            <BestTimeHeatmap data={heatmapData} />
          </TabsContent>

          <TabsContent value="audience" className="space-y-5">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <ChartCard title="Audience by Gender">
                <AudienceGenderChart data={audience?.gender ?? { female: 0, male: 0, unspecified: 0 }} />
              </ChartCard>
              <ChartCard title="Audience by Age">
                <AudienceAgeChart data={audience?.age ?? {}} />
              </ChartCard>
            </div>
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-5">
              <TopCountriesChart data={undefined} />
              <PostsByPlatform mentions={filtered} />
            </div>
          </TabsContent>

          <TabsContent value="content" className="space-y-5">
            <PostFormatChart data={postFormatData} />
            <PostsByPlatform mentions={filtered} />
            <BestTimeHeatmap data={heatmapData} />
          </TabsContent>

          <TabsContent value="hashtags" className="space-y-5">
            <TrendingHashtagsChart data={hashtagsData} />
            <HashtagPerformanceTable posts={filtered as unknown as { hashtags?: string[]; reach?: number; interactions?: number }[]} />
          </TabsContent>

          <TabsContent value="grade" className="space-y-5">
            <ChartCard title="Post Grade Distribution (A+ / A / B / C / D)">
              {overview ? (
                <GradeDistributionChart distribution={overview.grade_distribution} />
              ) : (
                <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
                  Loading…
                </div>
              )}
            </ChartCard>
            <p className="text-xs text-slate-500 dark:text-slate-400">
              Grade weighted score = (likes × 1) + (comments × 2) + (shares × 3) + (saves × 5).
              Quartile rank: top 10% → A+, next 15% → A, next 25% → B, next 25% → C, bottom 25% → D.
            </p>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}
