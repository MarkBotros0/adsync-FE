'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Eye, Share2, BadgeCheck, Music } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import {
  applyClientFiltering,
  DataTabHeader,
  DataTabPagination,
  FilterChip,
} from '@/components/competitor/DataTab';
import { RunActorButton } from '@/components/competitor/RunActorButton';
import {
  RunStatusBanner,
  bannerPropsFromResult,
} from '@/components/competitor/RunStatusBanner';
import { SummaryCards, type SummaryMetric } from '@/components/competitor/SummaryCards';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import { useFilteredSummary } from '@/hooks/useFilteredSummary';
import type {
  BrandUsage,
  CompetitorActorResult,
  CompetitorTarget,
  TikTokData,
  TikTokFilters,
  TikTokSummary,
  TikTokVideoResult,
} from '@/lib/types';

interface TikTokTabProps {
  competitorId: number;
  result: CompetitorActorResult<TikTokData> | null;
  target: CompetitorTarget | null;
  usage: BrandUsage | null;
  signal: number;
  onRunStarted: () => Promise<void> | void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Sort: Newest first' },
  { value: 'plays', label: 'Sort: Most plays' },
  { value: 'likes', label: 'Sort: Most likes' },
  { value: 'comments', label: 'Sort: Most comments' },
  { value: 'shares', label: 'Sort: Most shares' },
];

export function TikTokTab({
  competitorId,
  result,
  target,
  usage,
  signal,
  onRunStarted,
}: TikTokTabProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [hasMusic, setHasMusic] = useState(false);

  const status = result?.status ?? 'pending';
  const data = result?.data ?? null;
  const authors = data?.authors ?? [];
  const videos = data?.videos ?? [];
  const top = authors[0];

  const filterSpec: TikTokFilters = useMemo(
    () => ({
      has_music: hasMusic || undefined,
      search: search.trim() || undefined,
    }),
    [hasMusic, search],
  );

  const { summary, loading: summaryLoading, refreshing } = useFilteredSummary<TikTokSummary>(
    competitorId,
    'tiktok',
    filterSpec,
    signal,
    status === 'completed' && videos.length > 0,
  );

  const summaryMetrics = useMemo(() => buildTtMetrics(summary), [summary]);

  const filtered = useMemo(
    () =>
      applyClientFiltering<TikTokVideoResult>({
        rows: videos,
        search,
        searchAccessor: (v) => v.description ?? '',
        sort,
        sortFn: sortVideos,
        page,
        pageSize,
        preFilter: (v) => {
          if (hasMusic && !(v.music_name ?? '').trim()) return false;
          return true;
        },
      }),
    [videos, search, sort, page, pageSize, hasMusic],
  );

  useEffect(() => {
    setPage(0);
  }, [search, sort, hasMusic, pageSize]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-dk-border dark:bg-dk-surface">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {COMPETITOR_ACTOR_LABELS.tiktok}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {COMPETITOR_ACTOR_DESCRIPTIONS.tiktok}
          </p>
          {target?.target_value ? (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={target.target_value}>
              Target: @{target.target_value.replace(/^@/, '')}
            </p>
          ) : (
            <p className="mt-1 text-xs text-rose-500">No handle configured — add one to enable this scraper.</p>
          )}
          <RunStatusBanner {...bannerPropsFromResult(result)} />
        </div>
        <RunActorButton
          competitorId={competitorId}
          actorKey="tiktok"
          status={status}
          hasTarget={!!target?.target_value}
          lastCostUsd={target?.last_cost_usd ?? null}
          usage={usage}
          onStarted={onRunStarted}
        />
      </header>

      {(status === 'pending' || status === 'running' || status === 'failed') && (
        <ActorTabSkeleton
          status={status}
          actorLabel={COMPETITOR_ACTOR_LABELS.tiktok}
          description={COMPETITOR_ACTOR_DESCRIPTIONS.tiktok}
          error={result?.error ?? null}
        />
      )}

      {status === 'completed' && authors.length === 0 && videos.length === 0 && (
        <EmptyTab
          title="No TikTok results"
          description="The configured handle returned no data."
        />
      )}

      {status === 'completed' && (authors.length > 0 || videos.length > 0) && (
        <>
          {top && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-dk-border dark:bg-dk-surface">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {top.avatar ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={top.avatar}
                    alt={top.username}
                    className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-dk-border"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 dark:bg-dk-raised" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://tiktok.com/@${top.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-slate-900 hover:underline dark:text-white"
                    >
                      @{top.username}
                    </a>
                    {top.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
                  </div>
                  {top.nickname && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">{top.nickname}</div>
                  )}
                  {top.signature && (
                    <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                      {top.signature}
                    </p>
                  )}
                </div>
                <dl className="grid w-full grid-cols-3 gap-3 text-center sm:w-auto">
                  <Stat label="Followers" value={top.followers} />
                  <Stat label="Hearts" value={top.hearts} />
                  <Stat label="Videos" value={top.video_count} />
                </dl>
              </div>
            </section>
          )}

          <SummaryCards
            title="Pandas-powered summary"
            metrics={summaryMetrics}
            loading={summaryLoading}
            refreshing={refreshing}
          />

          {videos.length > 0 && (
            <>
              <DataTabHeader
                search={search}
                onSearch={setSearch}
                searchPlaceholder="Search video descriptions…"
                sort={sort}
                sortOptions={SORT_OPTIONS}
                onSort={setSort}
                pageSize={pageSize}
                onPageSize={setPageSize}
                filteredCount={filtered.filteredTotal}
                totalCount={filtered.total}
                filters={
                  <FilterChip active={hasMusic} onClick={() => setHasMusic((v) => !v)}>
                    Has music
                  </FilterChip>
                }
              />

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {filtered.rows.map((video) => (
                  <a
                    key={video.id ?? video.url}
                    href={video.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dk-border dark:bg-dk-surface"
                  >
                    <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-100 dark:bg-dk-raised">
                      {video.cover ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={video.cover}
                          alt={video.description ?? 'TikTok video'}
                          className="h-full w-full object-cover transition-transform group-hover:scale-105"
                          loading="lazy"
                        />
                      ) : (
                        <div className="grid h-full w-full place-items-center text-xs text-slate-400">
                          No preview
                        </div>
                      )}
                      <span className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                        <Eye className="mr-1 inline h-3 w-3" />
                        {formatNumber(video.plays)}
                      </span>
                    </div>
                    <div className="p-3">
                      {video.description && (
                        <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                          {video.description}
                        </p>
                      )}
                      {video.music_name && (
                        <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                          <Music className="h-3 w-3" />
                          <span className="truncate">{video.music_name}</span>
                        </div>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {formatNumber(video.likes)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {formatNumber(video.comments)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <Share2 className="h-3 w-3" /> {formatNumber(video.shares)}
                        </span>
                      </div>
                    </div>
                  </a>
                ))}
              </div>

              <DataTabPagination
                page={page}
                pageSize={pageSize}
                total={filtered.filteredTotal}
                onPage={setPage}
              />
            </>
          )}
        </>
      )}
    </div>
  );
}

function buildTtMetrics(summary: TikTokSummary | null): SummaryMetric[] {
  if (!summary) return [];
  const sparkValues = Object.values(summary.videos_per_week ?? {});
  const topTags = Object.entries(summary.top_hashtags ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `#${k} (${v})`)
    .join(' · ');

  return [
    {
      label: 'Followers',
      value: formatNumber(summary.followers ?? 0),
      hint: `${formatNumber(summary.hearts ?? 0)} total hearts`,
    },
    {
      label: 'Filtered videos',
      value: formatNumber(summary.filtered_total),
      hint: `${formatNumber(summary.total)} in latest scrape`,
      spark: sparkValues.length > 1 ? sparkValues : undefined,
    },
    {
      label: 'Median plays',
      value: summary.median_plays != null ? formatNumber(summary.median_plays) : '—',
      hint:
        summary.like_per_play_p50 != null
          ? `Like/play p50 ${(summary.like_per_play_p50 * 100).toFixed(1)}%`
          : undefined,
    },
    {
      label: 'Top hashtags',
      value: topTags || '—',
      hint:
        summary.avg_duration != null
          ? `Avg duration ${summary.avg_duration.toFixed(1)}s`
          : undefined,
    },
  ];
}

function sortVideos(a: TikTokVideoResult, b: TikTokVideoResult, sort: string): number {
  switch (sort) {
    case 'plays':
      return (b.plays ?? 0) - (a.plays ?? 0);
    case 'likes':
      return (b.likes ?? 0) - (a.likes ?? 0);
    case 'comments':
      return (b.comments ?? 0) - (a.comments ?? 0);
    case 'shares':
      return (b.shares ?? 0) - (a.shares ?? 0);
    default: {
      const at = a.create_time ? Date.parse(a.create_time) : 0;
      const bt = b.create_time ? Date.parse(b.create_time) : 0;
      return bt - at;
    }
  }
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
        {formatNumber(value)}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
