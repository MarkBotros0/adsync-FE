'use client';

import { useEffect, useMemo, useState } from 'react';
import { Star, MapPin, Phone, Globe, ExternalLink } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import {
  applyClientFiltering,
  DataTabHeader,
  DataTabPagination,
} from '@/components/competitor/DataTab';
import { RunActorButton } from '@/components/competitor/RunActorButton';
import {
  RunStatusBanner,
  bannerPropsFromResult,
} from '@/components/competitor/RunStatusBanner';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import type {
  BrandUsage,
  CompetitorActorResult,
  CompetitorTarget,
  GooglePlaceResult,
} from '@/lib/types';

interface PlacesTabProps {
  competitorId: number;
  result: CompetitorActorResult<GooglePlaceResult[]> | null;
  target: CompetitorTarget | null;
  usage: BrandUsage | null;
  onRunStarted: () => Promise<void> | void;
}

const SORT_OPTIONS = [
  { value: 'rating', label: 'Sort: Highest rated' },
  { value: 'reviews', label: 'Sort: Most reviewed' },
  { value: 'name', label: 'Sort: Name A→Z' },
];

export function PlacesTab({
  competitorId,
  result,
  target,
  usage,
  onRunStarted,
}: PlacesTabProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('rating');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const status = result?.status ?? 'pending';
  const places = (result?.data ?? []) as GooglePlaceResult[];

  const filtered = useMemo(
    () =>
      applyClientFiltering<GooglePlaceResult>({
        rows: places,
        search,
        searchAccessor: (p) => `${p.name ?? ''} ${p.address ?? ''} ${p.city ?? ''}`,
        sort,
        sortFn: sortPlaces,
        page,
        pageSize,
      }),
    [places, search, sort, page, pageSize],
  );

  useEffect(() => {
    setPage(0);
  }, [search, sort, pageSize]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-dk-border dark:bg-dk-surface">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {COMPETITOR_ACTOR_LABELS.google_places}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {COMPETITOR_ACTOR_DESCRIPTIONS.google_places}
          </p>
          {target?.target_value ? (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={target.target_value}>
              Query: “{target.target_value}”
            </p>
          ) : (
            <p className="mt-1 text-xs text-rose-500">No query configured.</p>
          )}
          <RunStatusBanner {...bannerPropsFromResult(result)} />
        </div>
        <RunActorButton
          competitorId={competitorId}
          actorKey="google_places"
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
              ? 'Click Run scraper to fetch Google Maps locations and reviews.'
              : 'Configure a Maps query above, then click Run scraper.'
          }
        />
      )}

      {(status === 'pending' || status === 'running' || status === 'failed') && (
        <ActorTabSkeleton
          status={status}
          actorLabel={COMPETITOR_ACTOR_LABELS.google_places}
          description={COMPETITOR_ACTOR_DESCRIPTIONS.google_places}
          error={result?.error ?? null}
        />
      )}

      {status === 'completed' && places.length === 0 && (
        <EmptyTab
          title="No Google Maps locations"
          description="No Google Maps locations matched the configured query."
        />
      )}

      {status === 'completed' && places.length > 0 && (
        <>
          <DataTabHeader
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search name, address, or city…"
            sort={sort}
            sortOptions={SORT_OPTIONS}
            onSort={setSort}
            pageSize={pageSize}
            onPageSize={setPageSize}
            filteredCount={filtered.filteredTotal}
            totalCount={filtered.total}
          />

          <div className="space-y-4">
            {filtered.rows.map((place) => (
              <article
                key={place.id ?? place.url}
                className="overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dk-border dark:bg-dk-surface"
              >
                <div className="grid gap-4 p-4 sm:p-5 md:grid-cols-[1fr_auto] md:items-start">
                  <div className="space-y-2">
                    <div className="flex items-center gap-2">
                      {place.url ? (
                        <a
                          href={place.url}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="text-base font-semibold text-slate-900 hover:underline dark:text-white"
                        >
                          {place.name}
                        </a>
                      ) : (
                        <span className="text-base font-semibold text-slate-900 dark:text-white">
                          {place.name}
                        </span>
                      )}
                      {place.category && (
                        <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-dk-raised dark:text-slate-200">
                          {place.category}
                        </span>
                      )}
                    </div>
                    {place.address && (
                      <div className="flex items-start gap-1.5 text-sm text-slate-600 dark:text-slate-300">
                        <MapPin className="mt-0.5 h-3.5 w-3.5 shrink-0 text-slate-400" />
                        <span>{place.address}</span>
                      </div>
                    )}
                    <div className="flex flex-wrap gap-3 text-xs text-slate-500 dark:text-slate-400">
                      {place.phone && (
                        <span className="inline-flex items-center gap-1">
                          <Phone className="h-3 w-3" /> {place.phone}
                        </span>
                      )}
                      {place.website && (
                        <a
                          href={place.website}
                          target="_blank"
                          rel="noopener noreferrer"
                          className="inline-flex items-center gap-1 text-blue-600 hover:underline dark:text-blue-400"
                        >
                          <Globe className="h-3 w-3" /> {hostname(place.website)}
                          <ExternalLink className="h-3 w-3" />
                        </a>
                      )}
                    </div>
                  </div>

                  <div className="rounded-lg bg-amber-50 px-4 py-3 text-center dark:bg-amber-500/10">
                    <div className="flex items-center justify-center gap-1 text-amber-700 dark:text-amber-300">
                      <Star className="h-5 w-5 fill-current" />
                      <span className="text-2xl font-bold tabular-nums">
                        {place.rating?.toFixed(1) ?? '—'}
                      </span>
                    </div>
                    <div className="text-xs text-amber-700/80 dark:text-amber-300/70">
                      {formatNumber(place.reviews_count)} reviews
                    </div>
                  </div>
                </div>

                {place.reviews.length > 0 && (
                  <div className="border-t border-slate-200 bg-slate-50/40 p-4 sm:p-5 dark:border-dk-border dark:bg-dk-raised/30">
                    <h4 className="mb-3 text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                      Recent reviews
                    </h4>
                    <ul className="space-y-3">
                      {place.reviews.map((r, i) => (
                        <li key={i} className="text-sm">
                          <div className="flex items-center gap-2">
                            <span className="font-semibold text-slate-700 dark:text-slate-200">
                              {r.name ?? 'Anonymous'}
                            </span>
                            <span className="inline-flex items-center gap-0.5 text-amber-500">
                              {Array.from({ length: Math.min(5, Math.max(0, r.rating)) }).map((_, j) => (
                                <Star key={j} className="h-3 w-3 fill-current" />
                              ))}
                            </span>
                          </div>
                          {r.text && (
                            <p className="mt-1 line-clamp-3 text-slate-600 dark:text-slate-300">
                              {r.text}
                            </p>
                          )}
                        </li>
                      ))}
                    </ul>
                  </div>
                )}
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

function sortPlaces(a: GooglePlaceResult, b: GooglePlaceResult, sort: string): number {
  switch (sort) {
    case 'reviews':
      return (b.reviews_count ?? 0) - (a.reviews_count ?? 0);
    case 'name':
      return (a.name ?? '').localeCompare(b.name ?? '');
    default:
      return (b.rating ?? 0) - (a.rating ?? 0);
  }
}

function hostname(url: string): string {
  try {
    return new URL(url).hostname.replace(/^www\./, '');
  } catch {
    return url;
  }
}
