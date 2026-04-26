'use client';

import { Loader2, TrendingUp } from 'lucide-react';
import { formatNumber } from '@/lib/utils';

export interface SummaryMetric {
  label: string;
  /** Pre-formatted display string (use formatNumber etc. before passing in). */
  value: string;
  /** Optional secondary label below the value. */
  hint?: string;
  /** Optional sparkline values — rendered as a tiny SVG line. */
  spark?: number[];
  /** Tone for the value text. */
  tone?: 'default' | 'good' | 'warn' | 'bad';
  /** Optional trailing element — eg a chip with a count. */
  trailing?: React.ReactNode;
}

interface SummaryCardsProps {
  title?: string;
  metrics: SummaryMetric[];
  loading?: boolean;
  /** When true, show a small spinner in the header (filters refetching). */
  refreshing?: boolean;
}

export function SummaryCards({ title, metrics, loading, refreshing }: SummaryCardsProps) {
  if (loading && metrics.length === 0) {
    return (
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {[0, 1, 2, 3].map((i) => (
          <div
            key={i}
            className="h-24 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface"
          />
        ))}
      </div>
    );
  }
  if (metrics.length === 0) return null;

  return (
    <section aria-label={title ?? 'Summary'} className="space-y-3">
      {title && (
        <header className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
          <TrendingUp className="h-3.5 w-3.5" />
          {title}
          {refreshing && <Loader2 className="ml-1 h-3 w-3 animate-spin opacity-60" />}
        </header>
      )}
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {metrics.map((m, i) => (
          <article
            key={`${m.label}-${i}`}
            className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm transition-shadow hover:shadow-md dark:border-dk-border dark:bg-dk-surface"
          >
            <div className="flex items-center justify-between gap-2">
              <span className="text-xs font-medium uppercase tracking-wide text-slate-500 dark:text-slate-400">
                {m.label}
              </span>
              {m.trailing}
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              <span className={`text-2xl font-semibold tabular-nums ${toneClass(m.tone)}`}>
                {m.value}
              </span>
              {m.spark && m.spark.length > 1 && <Sparkline values={m.spark} />}
            </div>
            {m.hint && (
              <p className="mt-1 truncate text-xs text-slate-500 dark:text-slate-400" title={m.hint}>
                {m.hint}
              </p>
            )}
          </article>
        ))}
      </div>
    </section>
  );
}

function toneClass(tone: SummaryMetric['tone']): string {
  switch (tone) {
    case 'good':
      return 'text-emerald-600 dark:text-emerald-300';
    case 'warn':
      return 'text-amber-600 dark:text-amber-300';
    case 'bad':
      return 'text-rose-600 dark:text-rose-300';
    default:
      return 'text-slate-900 dark:text-white';
  }
}

function Sparkline({ values }: { values: number[] }) {
  const w = 60;
  const h = 24;
  const max = Math.max(...values, 1);
  const min = Math.min(...values, 0);
  const range = max - min || 1;
  const step = w / (values.length - 1);
  const points = values
    .map((v, i) => `${i * step},${h - ((v - min) / range) * h}`)
    .join(' ');

  return (
    <svg width={w} height={h} viewBox={`0 0 ${w} ${h}`} className="text-blue-500" aria-hidden>
      <polyline
        points={points}
        fill="none"
        stroke="currentColor"
        strokeWidth="1.5"
        strokeLinecap="round"
        strokeLinejoin="round"
      />
    </svg>
  );
}

// ── Helpers for tabs to format common metric shapes ──────────────────────────

export function dictToMetricChips(
  dict: Record<string, number> | undefined,
  max = 6,
): { label: string; value: string }[] {
  if (!dict) return [];
  return Object.entries(dict)
    .sort((a, b) => b[1] - a[1])
    .slice(0, max)
    .map(([k, v]) => ({ label: k, value: formatNumber(v) }));
}
