'use client';

import { ExternalLink, HelpCircle } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import { RunActorButton } from '@/components/competitor/RunActorButton';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import type {
  BrandUsage,
  CompetitorActorResult,
  CompetitorTarget,
  GoogleSearchData,
} from '@/lib/types';

interface SerpTabProps {
  competitorId: number;
  result: CompetitorActorResult<GoogleSearchData> | null;
  target: CompetitorTarget | null;
  usage: BrandUsage | null;
  onRunStarted: () => Promise<void> | void;
}

export function SerpTab({ competitorId, result, target, usage, onRunStarted }: SerpTabProps) {
  const status = result?.status ?? 'pending';
  const data = result?.data ?? null;
  const organic = data?.organic ?? [];
  const paa = data?.people_also_ask ?? [];
  const related = data?.related ?? [];

  return (
    <div className="space-y-5">
      <header className="flex flex-col gap-3 rounded-xl border border-slate-200 bg-white p-4 sm:flex-row sm:items-center sm:justify-between dark:border-dk-border dark:bg-dk-surface">
        <div className="min-w-0">
          <p className="text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
            {COMPETITOR_ACTOR_LABELS.google_search}
          </p>
          <p className="text-sm text-slate-700 dark:text-slate-200">
            {COMPETITOR_ACTOR_DESCRIPTIONS.google_search}
          </p>
          {target?.target_value ? (
            <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={target.target_value}>
              Query: “{target.target_value}”
            </p>
          ) : (
            <p className="mt-1 text-xs text-rose-500">No query configured.</p>
          )}
        </div>
        <RunActorButton
          competitorId={competitorId}
          actorKey="google_search"
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
          actorLabel={COMPETITOR_ACTOR_LABELS.google_search}
          description={COMPETITOR_ACTOR_DESCRIPTIONS.google_search}
          error={result?.error ?? null}
        />
      )}

      {status === 'completed' && organic.length === 0 && (
        <EmptyTab
          title="No search results"
          description="Google didn’t return any organic results for this query."
        />
      )}

      {status === 'completed' && organic.length > 0 && (
        <div className="grid gap-6 lg:grid-cols-3">
          <div className="space-y-3 lg:col-span-2">
            <h3 className="text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              Top organic results
            </h3>
            <ol className="space-y-2">
              {organic.map((r, idx) => (
                <li
                  key={(r.url ?? '') + idx}
                  className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-dk-border dark:bg-dk-surface"
                >
                  <div className="flex items-start gap-3">
                    <span className="grid h-7 w-7 shrink-0 place-items-center rounded-md bg-slate-100 text-xs font-bold text-slate-600 dark:bg-dk-raised dark:text-slate-300">
                      {r.rank ?? idx + 1}
                    </span>
                    <div className="flex-1 min-w-0">
                      <div className="text-xs text-slate-500 dark:text-slate-400">{r.domain}</div>
                      <a
                        href={r.url ?? '#'}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="block truncate font-semibold text-blue-600 hover:underline dark:text-blue-400"
                      >
                        {r.title ?? r.url}
                        <ExternalLink className="ml-1 inline h-3 w-3" />
                      </a>
                      {r.description && (
                        <p className="mt-1 line-clamp-2 text-sm text-slate-600 dark:text-slate-300">
                          {r.description}
                        </p>
                      )}
                    </div>
                  </div>
                </li>
              ))}
            </ol>
          </div>

          <aside className="space-y-4">
            {paa.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-dk-border dark:bg-dk-surface">
                <h3 className="mb-3 flex items-center gap-2 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  <HelpCircle className="h-4 w-4" /> People also ask
                </h3>
                <ul className="space-y-2">
                  {paa.map((q, i) => (
                    <li
                      key={i}
                      className="border-l-2 border-blue-200 pl-3 text-sm text-slate-600 dark:border-blue-500/40 dark:text-slate-300"
                    >
                      {q}
                    </li>
                  ))}
                </ul>
              </div>
            )}
            {related.length > 0 && (
              <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-dk-border dark:bg-dk-surface">
                <h3 className="mb-3 text-sm font-semibold text-slate-700 dark:text-slate-200">
                  Related searches
                </h3>
                <div className="flex flex-wrap gap-2">
                  {related.map((r) => (
                    <span
                      key={r}
                      className="rounded-full bg-slate-100 px-2.5 py-1 text-xs text-slate-700 dark:bg-dk-raised dark:text-slate-200"
                    >
                      {r}
                    </span>
                  ))}
                </div>
              </div>
            )}
          </aside>
        </div>
      )}
    </div>
  );
}
