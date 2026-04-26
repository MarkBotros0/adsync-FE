'use client';

import { useEffect, useMemo, useState } from 'react';
import { Heart, MessageCircle, Eye, BadgeCheck, ExternalLink } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import {
  applyClientFiltering,
  DataTabHeader,
  DataTabPagination,
  FilterChip,
} from '@/components/competitor/DataTab';
import { RunActorButton } from '@/components/competitor/RunActorButton';
import { SummaryCards, type SummaryMetric } from '@/components/competitor/SummaryCards';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import { formatNumber, proxyImage } from '@/lib/utils';
import { useFilteredSummary } from '@/hooks/useFilteredSummary';
import type {
  BrandUsage,
  CompetitorActorResult,
  CompetitorTarget,
  InstagramData,
  InstagramFilters,
  InstagramPostResult,
  InstagramSummary,
} from '@/lib/types';

interface InstagramTabProps {
  competitorId: number;
  result: CompetitorActorResult<InstagramData> | null;
  target: CompetitorTarget | null;
  usage: BrandUsage | null;
  signal: number;
  onRunStarted: () => Promise<void> | void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Sort: Newest first' },
  { value: 'likes', label: 'Sort: Most likes' },
  { value: 'comments', label: 'Sort: Most comments' },
  { value: 'views', label: 'Sort: Most views' },
];

export function InstagramTab({
  competitorId,
  result,
  target,
  usage,
  signal,
  onRunStarted,
}: InstagramTabProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [typeFilter, setTypeFilter] = useState<'all' | 'Image' | 'Video' | 'Sidecar'>('all');
  const [hasCaption, setHasCaption] = useState(false);

  const status = result?.status ?? 'pending';
  const data = result?.data ?? null;
  const profiles = data?.profiles ?? [];
  const posts = data?.posts ?? [];
  const top = profiles[0];

  const filterSpec: InstagramFilters = useMemo(
    () => ({
      type: typeFilter === 'all' ? undefined : typeFilter,
      has_caption: hasCaption || undefined,
      search: search.trim() || undefined,
    }),
    [typeFilter, hasCaption, search],
  );

  const { summary, loading: summaryLoading, refreshing } = useFilteredSummary<InstagramSummary>(
    competitorId,
    'instagram',
    filterSpec,
    signal,
    status === 'completed' && posts.length > 0,
  );

  const summaryMetrics = useMemo(() => buildIgMetrics(summary), [summary]);

  const filtered = useMemo(
    () =>
      applyClientFiltering<InstagramPostResult>({
        rows: posts,
        search,
        searchAccessor: (p) => p.caption ?? '',
        sort,
        sortFn: sortPosts,
        page,
        pageSize,
        preFilter: (p) => {
          if (typeFilter !== 'all' && (p.type ?? '').toLowerCase() !== typeFilter.toLowerCase()) {
            return false;
          }
          if (hasCaption && !(p.caption ?? '').trim()) return false;
          return true;
        },
      }),
    [posts, search, sort, page, pageSize, typeFilter, hasCaption],
  );

  useEffect(() => {
    setPage(0);
  }, [search, sort, typeFilter, hasCaption, pageSize]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-dk-border dark:bg-dk-surface">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {COMPETITOR_ACTOR_LABELS.instagram}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {COMPETITOR_ACTOR_DESCRIPTIONS.instagram}
          </p>
          {target?.target_value ? (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={target.target_value}>
              Target: @{target.target_value.replace(/^@/, '')}
            </p>
          ) : (
            <p className="mt-1 text-xs text-rose-500">No handle configured — add one to enable this scraper.</p>
          )}
        </div>
        <RunActorButton
          competitorId={competitorId}
          actorKey="instagram"
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
          actorLabel={COMPETITOR_ACTOR_LABELS.instagram}
          description={COMPETITOR_ACTOR_DESCRIPTIONS.instagram}
          error={result?.error ?? null}
        />
      )}

      {status === 'completed' && profiles.length === 0 && posts.length === 0 && (
        <EmptyTab
          title="No Instagram results"
          description="The configured handle returned no data."
        />
      )}

      {status === 'completed' && (profiles.length > 0 || posts.length > 0) && (
        <>
          {top && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-dk-border dark:bg-dk-surface">
              <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
                {top.profile_pic_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proxyImage(top.profile_pic_url)}
                    alt={top.username ?? 'Profile'}
                    className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-dk-border"
                  />
                ) : (
                  <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 dark:bg-dk-raised" />
                )}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2">
                    <a
                      href={`https://instagram.com/${top.username}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-base font-semibold text-slate-900 hover:underline dark:text-white"
                    >
                      @{top.username}
                    </a>
                    {top.is_verified && (
                      <BadgeCheck className="h-4 w-4 text-blue-500" aria-label="Verified" />
                    )}
                  </div>
                  {top.full_name && (
                    <div className="text-sm text-slate-600 dark:text-slate-300">{top.full_name}</div>
                  )}
                  {top.biography && (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                      {top.biography}
                    </p>
                  )}
                  {top.external_url && (
                    <a
                      href={top.external_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      {top.external_url} <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
                <dl className="grid w-full grid-cols-3 gap-3 text-center sm:w-auto">
                  <Stat label="Followers" value={top.followers} />
                  <Stat label="Following" value={top.follows} />
                  <Stat label="Posts" value={top.posts_count} />
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

          {posts.length > 0 && (
            <>
              <DataTabHeader
                search={search}
                onSearch={setSearch}
                searchPlaceholder="Search captions…"
                sort={sort}
                sortOptions={SORT_OPTIONS}
                onSort={setSort}
                pageSize={pageSize}
                onPageSize={setPageSize}
                filteredCount={filtered.filteredTotal}
                totalCount={filtered.total}
                filters={
                  <>
                    <FilterChip active={typeFilter === 'all'} onClick={() => setTypeFilter('all')}>
                      All types
                    </FilterChip>
                    <FilterChip active={typeFilter === 'Image'} onClick={() => setTypeFilter('Image')}>
                      Images
                    </FilterChip>
                    <FilterChip active={typeFilter === 'Video'} onClick={() => setTypeFilter('Video')}>
                      Videos
                    </FilterChip>
                    <FilterChip active={typeFilter === 'Sidecar'} onClick={() => setTypeFilter('Sidecar')}>
                      Carousels
                    </FilterChip>
                    <FilterChip active={hasCaption} onClick={() => setHasCaption((v) => !v)}>
                      Has caption
                    </FilterChip>
                  </>
                }
              />

              <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
                {filtered.rows.map((post) => (
                  <a
                    key={post.id ?? post.url}
                    href={post.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dk-border dark:bg-dk-surface"
                  >
                    {post.display_url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={proxyImage(post.display_url)}
                        alt={post.caption ?? 'Instagram post'}
                        className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                        loading="lazy"
                      />
                    ) : (
                      <div className="grid aspect-square w-full place-items-center bg-slate-100 text-xs text-slate-400 dark:bg-dk-raised">
                        No preview
                      </div>
                    )}
                    <div className="p-3">
                      {post.caption && (
                        <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                          {post.caption}
                        </p>
                      )}
                      <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                        <span className="inline-flex items-center gap-1">
                          <Heart className="h-3 w-3" /> {formatNumber(post.likes)}
                        </span>
                        <span className="inline-flex items-center gap-1">
                          <MessageCircle className="h-3 w-3" /> {formatNumber(post.comments)}
                        </span>
                        {post.video_views > 0 && (
                          <span className="inline-flex items-center gap-1">
                            <Eye className="h-3 w-3" /> {formatNumber(post.video_views)}
                          </span>
                        )}
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

function buildIgMetrics(summary: InstagramSummary | null): SummaryMetric[] {
  if (!summary) return [];
  const sparkValues = Object.values(summary.posts_per_week ?? {});
  const topTags = Object.entries(summary.top_hashtags ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `#${k} (${v})`)
    .join(' · ');

  return [
    {
      label: 'Followers',
      value: formatNumber(summary.followers ?? 0),
      hint:
        summary.engagement_rate != null
          ? `Avg engagement ${(summary.engagement_rate * 100).toFixed(2)}%`
          : 'Engagement n/a',
    },
    {
      label: 'Filtered posts',
      value: formatNumber(summary.filtered_total),
      hint: `${formatNumber(summary.total)} in latest scrape`,
      spark: sparkValues.length > 1 ? sparkValues : undefined,
    },
    {
      label: 'Median likes',
      value: summary.median_likes != null ? formatNumber(summary.median_likes) : '—',
      hint:
        summary.p90_likes != null ? `p90 ${formatNumber(summary.p90_likes)}` : undefined,
    },
    {
      label: 'Top hashtags',
      value: topTags || '—',
      hint:
        summary.peak_post_hour != null
          ? `Peak post hour: ${summary.peak_post_hour}:00 UTC`
          : undefined,
    },
  ];
}

function sortPosts(a: InstagramPostResult, b: InstagramPostResult, sort: string): number {
  switch (sort) {
    case 'likes':
      return (b.likes ?? 0) - (a.likes ?? 0);
    case 'comments':
      return (b.comments ?? 0) - (a.comments ?? 0);
    case 'views':
      return (b.video_views ?? 0) - (a.video_views ?? 0);
    default: {
      const at = a.timestamp ? Date.parse(a.timestamp) : 0;
      const bt = b.timestamp ? Date.parse(b.timestamp) : 0;
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
