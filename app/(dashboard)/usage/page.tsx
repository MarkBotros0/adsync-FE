'use client';

import { useCallback, useEffect, useState } from 'react';
import { ArrowLeft, Wallet } from 'lucide-react';
import Link from 'next/link';
import { Button } from '@/components/ui/Button';
import { BudgetBanner } from '@/components/competitor/BudgetBanner';
import { COMPETITOR_ACTOR_LABELS } from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import { usageAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { useBrandUsage } from '@/hooks/useBrandUsage';
import type { ApifyRunRecord, CompetitorActorKey } from '@/lib/types';

const PAGE_SIZE = 25;

export default function UsagePage() {
  const { token, isLoading: authLoading } = useBrandAuthContext();
  const { usage, loading: usageLoading, refresh } = useBrandUsage();
  const [runs, setRuns] = useState<ApifyRunRecord[]>([]);
  const [cursor, setCursor] = useState<number | null>(null);
  const [nextCursor, setNextCursor] = useState<number | null>(null);
  const [loadingRuns, setLoadingRuns] = useState(false);

  const loadRuns = useCallback(
    async (resetCursor: number | null = null) => {
      if (!token) return;
      setLoadingRuns(true);
      try {
        const res = await usageAPI.brandRuns(token, { limit: PAGE_SIZE, cursor: resetCursor });
        const items = res.data.data.items;
        setRuns((prev) => (resetCursor === null ? items : [...prev, ...items]));
        setNextCursor(res.data.data.next_cursor);
      } finally {
        setLoadingRuns(false);
      }
    },
    [token],
  );

  useEffect(() => {
    if (authLoading) return;
    setRuns([]);
    setCursor(null);
    void loadRuns(null);
  }, [authLoading, loadRuns]);

  const handleLoadMore = () => {
    if (nextCursor == null) return;
    setCursor(nextCursor);
    void loadRuns(nextCursor);
  };

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-50 dark:bg-dk-bg">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5 dark:border-dk-border dark:bg-dk-surface md:px-8">
        <Link
          href="/competitor-analysis"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back
        </Link>
        <div className="mt-3 flex items-start gap-3">
          <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md">
            <Wallet className="h-5 w-5" />
          </span>
          <div>
            <h1 className="text-xl font-semibold text-slate-900 dark:text-white">Apify usage</h1>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Per-brand compute units &amp; spend, updated each time a scraper finishes.
            </p>
          </div>
        </div>
      </header>

      <main className="flex-1 space-y-6 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        {usage && <BudgetBanner usage={usage} />}

        <section className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <Stat
            label="Compute units"
            value={usage ? usage.compute_units_used.toFixed(2) : '—'}
            hint={
              usage?.budget.monthly_compute_unit_budget != null
                ? `of ${usage.budget.monthly_compute_unit_budget.toFixed(0)} CU budget`
                : 'No cap configured'
            }
          />
          <Stat
            label="USD spent"
            value={usage ? `$${usage.usage_usd.toFixed(2)}` : '—'}
            hint={
              usage?.budget.percent_used != null
                ? `${Math.round(usage.budget.percent_used)}% of budget`
                : undefined
            }
          />
          <Stat
            label="Runs this period"
            value={usage ? formatNumber(usage.runs) : '—'}
          />
          <Stat
            label="Period start"
            value={
              usage
                ? new Date(usage.period_start).toLocaleDateString('en-US', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  })
                : '—'
            }
          />
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dk-border dark:bg-dk-surface">
          <div className="border-b border-slate-200 px-5 py-3 dark:border-dk-border">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Per-scraper breakdown
            </h2>
          </div>
          <div className="divide-y divide-slate-200 dark:divide-dk-border">
            {usage && Object.keys(usage.by_actor).length === 0 && (
              <p className="px-5 py-8 text-center text-sm text-slate-500 dark:text-slate-400">
                No runs recorded yet this period.
              </p>
            )}
            {usage &&
              Object.entries(usage.by_actor).map(([key, vals]) => (
                <div
                  key={key}
                  className="flex items-center justify-between gap-4 px-5 py-3 text-sm"
                >
                  <span className="font-medium text-slate-700 dark:text-slate-200">
                    {COMPETITOR_ACTOR_LABELS[key as CompetitorActorKey] ?? key}
                  </span>
                  <span className="text-slate-500 dark:text-slate-400">
                    {vals.runs} run{vals.runs === 1 ? '' : 's'} · {vals.compute_units.toFixed(2)} CU · $
                    {vals.usage_usd.toFixed(2)}
                  </span>
                </div>
              ))}
          </div>
        </section>

        <section className="rounded-xl border border-slate-200 bg-white shadow-sm dark:border-dk-border dark:bg-dk-surface">
          <div className="border-b border-slate-200 px-5 py-3 dark:border-dk-border">
            <h2 className="text-sm font-semibold text-slate-700 dark:text-slate-200">
              Recent runs
            </h2>
          </div>
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-slate-200 text-sm dark:divide-dk-border">
              <thead className="text-left text-xs uppercase tracking-wider text-slate-500 dark:text-slate-400">
                <tr>
                  <th className="px-5 py-3">When</th>
                  <th className="px-5 py-3">Scraper</th>
                  <th className="px-5 py-3">Status</th>
                  <th className="px-5 py-3 text-right">Compute units</th>
                  <th className="px-5 py-3 text-right">USD</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-slate-200 dark:divide-dk-border">
                {runs.length === 0 && !loadingRuns && (
                  <tr>
                    <td colSpan={5} className="px-5 py-8 text-center text-slate-500 dark:text-slate-400">
                      No runs recorded.
                    </td>
                  </tr>
                )}
                {runs.map((r) => (
                  <tr key={r.id}>
                    <td className="whitespace-nowrap px-5 py-3 text-slate-700 dark:text-slate-200">
                      {new Date(r.created_at).toLocaleString()}
                    </td>
                    <td className="px-5 py-3 text-slate-700 dark:text-slate-200">
                      {COMPETITOR_ACTOR_LABELS[r.actor_key] ?? r.actor_key}
                    </td>
                    <td className="px-5 py-3">
                      <span className={`inline-flex rounded-full px-2 py-0.5 text-xs font-medium ${statusBadge(r.status)}`}>
                        {r.status}
                      </span>
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums text-slate-700 dark:text-slate-200">
                      {r.compute_units != null ? Number(r.compute_units).toFixed(3) : '—'}
                    </td>
                    <td className="whitespace-nowrap px-5 py-3 text-right tabular-nums text-slate-700 dark:text-slate-200">
                      {r.usage_total_usd != null ? `$${Number(r.usage_total_usd).toFixed(4)}` : '—'}
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <div className="flex items-center justify-between gap-2 border-t border-slate-200 px-5 py-3 dark:border-dk-border">
            <span className="text-xs text-slate-500 dark:text-slate-400">
              {runs.length} loaded
            </span>
            <Button
              variant="outline"
              size="sm"
              onClick={handleLoadMore}
              disabled={nextCursor == null || loadingRuns}
            >
              {loadingRuns ? 'Loading…' : nextCursor == null ? 'End of list' : 'Load more'}
            </Button>
          </div>
        </section>

        {(usageLoading || authLoading) && (
          <p className="text-xs text-slate-500 dark:text-slate-400">Loading…</p>
        )}
      </main>
    </div>
  );
}

function Stat({
  label,
  value,
  hint,
}: {
  label: string;
  value: string;
  hint?: string;
}) {
  return (
    <div className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-dk-border dark:bg-dk-surface">
      <div className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
        {label}
      </div>
      <div className="mt-1 text-2xl font-semibold tabular-nums text-slate-900 dark:text-white">
        {value}
      </div>
      {hint && (
        <div className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">{hint}</div>
      )}
    </div>
  );
}

function statusBadge(status: string): string {
  switch (status) {
    case 'succeeded':
      return 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300';
    case 'failed':
    case 'timed-out':
      return 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300';
    case 'running':
      return 'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300';
    default:
      return 'bg-slate-100 text-slate-700 dark:bg-dk-raised dark:text-slate-200';
  }
}
