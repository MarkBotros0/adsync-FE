'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink } from 'lucide-react';
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
import { formatNumber, proxyImage } from '@/lib/utils';
import { useFilteredSummary } from '@/hooks/useFilteredSummary';
import type {
  BrandUsage,
  CompetitorActorResult,
  CompetitorTarget,
  FacebookAdResult,
  MetaAdsFilters,
  MetaAdsSummary,
} from '@/lib/types';

interface AdsTabProps {
  competitorId: number;
  result: CompetitorActorResult<FacebookAdResult[]> | null;
  target: CompetitorTarget | null;
  usage: BrandUsage | null;
  signal: number;
  onRunStarted: () => Promise<void> | void;
}

const SORT_OPTIONS = [
  { value: 'newest', label: 'Sort: Newest first' },
  { value: 'oldest', label: 'Sort: Oldest first' },
  { value: 'longest', label: 'Sort: Longest run' },
  { value: 'shortest', label: 'Sort: Shortest run' },
];

export function AdsTab({
  competitorId,
  result,
  target,
  usage,
  signal,
  onRunStarted,
}: AdsTabProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('newest');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(24);
  const [statusFilter, setStatusFilter] = useState<'all' | 'active' | 'inactive'>('all');
  const [hasVideo, setHasVideo] = useState(false);

  const filterSpec: MetaAdsFilters = useMemo(
    () => ({
      status: statusFilter,
      has_video: hasVideo || undefined,
      search: search.trim() || undefined,
    }),
    [statusFilter, hasVideo, search],
  );

  const status = result?.status ?? 'pending';
  const ads = (result?.data ?? []) as FacebookAdResult[];

  const { summary, loading: summaryLoading, refreshing } = useFilteredSummary<MetaAdsSummary>(
    competitorId,
    'facebook_ads',
    filterSpec,
    signal,
    status === 'completed' && ads.length > 0,
  );

  const summaryMetrics = useMemo(() => buildMetrics(summary), [summary]);

  const filtered = useMemo(
    () =>
      applyClientFiltering<FacebookAdResult>({
        rows: ads,
        search,
        searchAccessor: (r) => `${r.body ?? ''} ${r.page_name ?? ''} ${r.cta ?? ''}`,
        sort,
        sortFn: sortAds,
        page,
        pageSize,
        preFilter: (r) => {
          if (statusFilter === 'active' && !r.is_active) return false;
          if (statusFilter === 'inactive' && r.is_active) return false;
          if (hasVideo && !r.media.some((m) => m.type === 'video')) return false;
          return true;
        },
      }),
    [ads, search, sort, page, pageSize, statusFilter, hasVideo],
  );

  // Reset to page 0 whenever filters / sort change.
  useEffect(() => {
    setPage(0);
  }, [search, sort, statusFilter, hasVideo, pageSize]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-dk-border dark:bg-dk-surface">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {COMPETITOR_ACTOR_LABELS.facebook_ads}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {COMPETITOR_ACTOR_DESCRIPTIONS.facebook_ads}
          </p>
          {target?.target_value ? (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={target.target_value}>
              Target: {target.target_value}
            </p>
          ) : (
            <p className="mt-1 text-xs text-rose-500">No target configured — add one to enable this scraper.</p>
          )}
          <RunStatusBanner {...bannerPropsFromResult(result)} />
        </div>
        <RunActorButton
          competitorId={competitorId}
          actorKey="facebook_ads"
          status={status}
          hasTarget={!!target?.target_value}
          lastCostUsd={target?.last_cost_usd ?? null}
          usage={usage}
          onStarted={onRunStarted}
        />
      </header>

      {status === 'idle' && (
        <EmptyTab
          title="Not run yet"
          description={
            target?.target_value
              ? 'Click Run scraper to fetch active ads from the Meta Ad Library.'
              : 'Configure a Facebook Page URL above, then click Run scraper.'
          }
        />
      )}

      {(status === 'pending' || status === 'running' || status === 'failed') && (
        <ActorTabSkeleton
          status={status}
          actorLabel={COMPETITOR_ACTOR_LABELS.facebook_ads}
          description={COMPETITOR_ACTOR_DESCRIPTIONS.facebook_ads}
          error={result?.error ?? null}
        />
      )}

      {status === 'completed' && ads.length === 0 && (
        <EmptyTab
          title="No active ads found"
          description="The configured Facebook Page returned no Ad Library matches."
        />
      )}

      {status === 'completed' && ads.length > 0 && (
        <>
          <SummaryCards
            title="Pandas-powered summary"
            metrics={summaryMetrics}
            loading={summaryLoading}
            refreshing={refreshing}
          />

          <DataTabHeader
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search ad copy, page, or CTA…"
            sort={sort}
            sortOptions={SORT_OPTIONS}
            onSort={setSort}
            pageSize={pageSize}
            onPageSize={setPageSize}
            filteredCount={filtered.filteredTotal}
            totalCount={filtered.total}
            filters={
              <>
                <FilterChip
                  active={statusFilter === 'all'}
                  onClick={() => setStatusFilter('all')}
                >
                  All
                </FilterChip>
                <FilterChip
                  active={statusFilter === 'active'}
                  onClick={() => setStatusFilter('active')}
                >
                  Active
                </FilterChip>
                <FilterChip
                  active={statusFilter === 'inactive'}
                  onClick={() => setStatusFilter('inactive')}
                >
                  Inactive
                </FilterChip>
                <FilterChip active={hasVideo} onClick={() => setHasVideo((v) => !v)}>
                  Has video
                </FilterChip>
              </>
            }
          />

          <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
            {filtered.rows.map((ad, idx) => (
              <article
                key={ad.id ?? idx}
                className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dk-border dark:bg-dk-surface"
              >
                {ad.media[0]?.url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proxyImage(ad.media[0].url)}
                    alt={ad.body ?? 'Ad creative'}
                    className="aspect-video w-full object-cover"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid aspect-video w-full place-items-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-dk-raised dark:to-dk-bg">
                    No preview
                  </div>
                )}
                <div className="flex flex-1 flex-col gap-3 p-4">
                  <div className="flex items-center justify-between">
                    <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                      {ad.page_name ?? 'Unknown page'}
                    </span>
                    {ad.is_active ? (
                      <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                        Active
                      </span>
                    ) : (
                      <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                        Inactive
                      </span>
                    )}
                  </div>
                  {ad.body && (
                    <p className="line-clamp-4 text-sm text-slate-600 dark:text-slate-300">
                      {ad.body}
                    </p>
                  )}
                  <div className="mt-auto flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
                    <span>{formatDateRange(ad.start_date, ad.end_date)}</span>
                    {ad.cta && (
                      <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                        {ad.cta}
                      </span>
                    )}
                  </div>
                  {ad.link_url && (
                    <a
                      href={ad.link_url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                    >
                      View destination <ExternalLink className="h-3 w-3" />
                    </a>
                  )}
                </div>
              </article>
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
    </div>
  );
}

function buildMetrics(summary: MetaAdsSummary | null): SummaryMetric[] {
  if (!summary) return [];
  const sparkValues = Object.values(summary.ads_per_week ?? {});
  const platforms = Object.entries(summary.platforms_breakdown ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 3)
    .map(([k, v]) => `${k}: ${formatNumber(v)}`)
    .join(' · ');
  const topRegions = Object.entries(summary.regions_top ?? {})
    .sort((a, b) => b[1] - a[1])
    .slice(0, 2)
    .map(([k]) => k)
    .join(' · ');

  return [
    {
      label: 'Filtered ads',
      value: formatNumber(summary.filtered_total),
      hint: `${formatNumber(summary.total)} in latest scrape`,
      spark: sparkValues.length > 1 ? sparkValues : undefined,
    },
    {
      label: 'Active right now',
      value: formatNumber(summary.ads_active),
      hint: summary.ads_with_video
        ? `${formatNumber(summary.ads_with_video)} contain video`
        : 'No video creatives',
      tone: summary.ads_active > 0 ? 'good' : 'default',
    },
    {
      label: 'Median run length',
      value:
        summary.median_run_days != null
          ? `${summary.median_run_days.toFixed(1)}d`
          : '—',
      hint:
        summary.p90_run_days != null
          ? `p90 ${summary.p90_run_days.toFixed(1)}d`
          : undefined,
    },
    {
      label: 'Top platforms',
      value: platforms || '—',
      hint: topRegions ? `Regions: ${topRegions}` : undefined,
    },
  ];
}

function sortAds(a: FacebookAdResult, b: FacebookAdResult, sort: string): number {
  const aStart = a.start_date ? Date.parse(a.start_date) : 0;
  const bStart = b.start_date ? Date.parse(b.start_date) : 0;
  const aEnd = a.end_date ? Date.parse(a.end_date) : Date.now();
  const bEnd = b.end_date ? Date.parse(b.end_date) : Date.now();
  switch (sort) {
    case 'oldest':
      return aStart - bStart;
    case 'longest':
      return bEnd - bStart - (aEnd - aStart);
    case 'shortest':
      return aEnd - aStart - (bEnd - bStart);
    default:
      return bStart - aStart;
  }
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return '—';
  const fmt = (s: string | null) => {
    if (!s) return '';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start) || fmt(end);
}
