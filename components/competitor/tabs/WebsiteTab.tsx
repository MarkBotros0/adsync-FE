'use client';

import { useEffect, useMemo, useState } from 'react';
import { ExternalLink, FileText } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import {
  applyClientFiltering,
  DataTabHeader,
  DataTabPagination,
} from '@/components/competitor/DataTab';
import { RunActorButton } from '@/components/competitor/RunActorButton';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import type {
  BrandUsage,
  CompetitorActorResult,
  CompetitorTarget,
  WebsitePageResult,
} from '@/lib/types';

interface WebsiteTabProps {
  competitorId: number;
  result: CompetitorActorResult<WebsitePageResult[]> | null;
  target: CompetitorTarget | null;
  usage: BrandUsage | null;
  onRunStarted: () => Promise<void> | void;
}

const SORT_OPTIONS = [
  { value: 'words-desc', label: 'Sort: Longest pages' },
  { value: 'words-asc', label: 'Sort: Shortest pages' },
  { value: 'title', label: 'Sort: Title A→Z' },
];

export function WebsiteTab({
  competitorId,
  result,
  target,
  usage,
  onRunStarted,
}: WebsiteTabProps) {
  const [search, setSearch] = useState('');
  const [sort, setSort] = useState('words-desc');
  const [page, setPage] = useState(0);
  const [pageSize, setPageSize] = useState(12);

  const status = result?.status ?? 'pending';
  const pages = (result?.data ?? []) as WebsitePageResult[];
  const homepage = pages.find((p) => isRoot(p.url ?? '')) ?? pages[0];

  const filtered = useMemo(
    () =>
      applyClientFiltering<WebsitePageResult>({
        rows: pages,
        search,
        searchAccessor: (p) => `${p.title ?? ''} ${p.url ?? ''}`,
        sort,
        sortFn: sortPages,
        page,
        pageSize,
      }),
    [pages, search, sort, page, pageSize],
  );

  useEffect(() => {
    setPage(0);
  }, [search, sort, pageSize]);

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-dk-border dark:bg-dk-surface">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {COMPETITOR_ACTOR_LABELS.website}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {COMPETITOR_ACTOR_DESCRIPTIONS.website}
          </p>
          {target?.target_value ? (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={target.target_value}>
              URL: {target.target_value}
            </p>
          ) : (
            <p className="mt-1 text-xs text-rose-500">No URL configured.</p>
          )}
        </div>
        <RunActorButton
          competitorId={competitorId}
          actorKey="website"
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
          actorLabel={COMPETITOR_ACTOR_LABELS.website}
          description={COMPETITOR_ACTOR_DESCRIPTIONS.website}
          error={result?.error ?? null}
        />
      )}

      {status === 'completed' && pages.length === 0 && (
        <EmptyTab
          title="No website content found"
          description="The crawler didn’t return any pages. The site may be blocked or the URL didn’t resolve."
        />
      )}

      {status === 'completed' && pages.length > 0 && (
        <>
          {homepage && (
            <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-dk-border dark:bg-dk-surface">
              <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Homepage messaging
              </h3>
              {homepage.title && (
                <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
                  {homepage.title}
                </h4>
              )}
              {homepage.description && (
                <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
                  {homepage.description}
                </p>
              )}
              {homepage.headings.length > 0 && (
                <div className="mt-4">
                  <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                    Top headings
                  </div>
                  <ul className="mt-2 flex flex-wrap gap-2">
                    {homepage.headings.map((h, i) => (
                      <li
                        key={i}
                        className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-dk-raised dark:text-slate-200"
                      >
                        {h}
                      </li>
                    ))}
                  </ul>
                </div>
              )}
              {homepage.url && (
                <a
                  href={homepage.url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {homepage.url} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </section>
          )}

          <DataTabHeader
            search={search}
            onSearch={setSearch}
            searchPlaceholder="Search title or URL…"
            sort={sort}
            sortOptions={SORT_OPTIONS}
            onSort={setSort}
            pageSize={pageSize}
            onPageSize={setPageSize}
            filteredCount={filtered.filteredTotal}
            totalCount={filtered.total}
          />

          <ul className="grid gap-3 sm:grid-cols-2">
            {filtered.rows.map((p, i) => (
              <li
                key={(p.url ?? '') + i}
                className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-dk-border dark:bg-dk-surface"
              >
                <div className="flex items-start gap-2">
                  <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                  <div className="flex-1 min-w-0">
                    <a
                      href={p.url ?? '#'}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="block truncate font-semibold text-slate-900 hover:underline dark:text-white"
                    >
                      {p.title ?? p.url}
                    </a>
                    <div className="truncate text-xs text-slate-500 dark:text-slate-400">{p.url}</div>
                    {p.excerpt && (
                      <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                        {p.excerpt}
                      </p>
                    )}
                    <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                      {formatNumber(p.word_count)} words
                    </div>
                  </div>
                </div>
              </li>
            ))}
          </ul>

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

function sortPages(a: WebsitePageResult, b: WebsitePageResult, sort: string): number {
  switch (sort) {
    case 'words-asc':
      return (a.word_count ?? 0) - (b.word_count ?? 0);
    case 'title':
      return (a.title ?? '').localeCompare(b.title ?? '');
    default:
      return (b.word_count ?? 0) - (a.word_count ?? 0);
  }
}

function isRoot(url: string): boolean {
  try {
    const u = new URL(url);
    return u.pathname === '/' || u.pathname === '';
  } catch {
    return false;
  }
}
