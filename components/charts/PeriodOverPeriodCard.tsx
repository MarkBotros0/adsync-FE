'use client';

import { ArrowDown, ArrowUp, Minus } from 'lucide-react';
import { cn } from '@/lib/utils';

interface PeriodOverPeriodCardProps {
  label: string;
  value: string | number;
  unit?: string;
  deltaPct?: number | null;
  /** When false, renders without the delta row (use for tiles where comparison is N/A). */
  hideDelta?: boolean;
  className?: string;
}

/**
 * Generic KPI tile with a value + optional period-over-period delta arrow.
 * The contract matches the backend `build_kpi_tile()` shape so any KPI from
 * `compare_periods()` can render with this component without per-tile code.
 */
export function PeriodOverPeriodCard({
  label,
  value,
  unit,
  deltaPct,
  hideDelta,
  className,
}: PeriodOverPeriodCardProps) {
  const direction =
    deltaPct == null ? null : deltaPct > 0 ? 'up' : deltaPct < 0 ? 'down' : 'flat';

  return (
    <div
      className={cn(
        'rounded-xl border border-slate-200 bg-white p-4 shadow-sm',
        'dark:border-dk-border dark:bg-dk-surface',
        className,
      )}
    >
      <p className="text-[11px] font-semibold uppercase tracking-[0.16em] text-slate-500 dark:text-slate-400">
        {label}
      </p>
      <p className="mt-2 font-mono text-2xl font-bold tabular-nums text-slate-900 dark:text-slate-50">
        {value}
        {unit ? <span className="ml-1 text-base font-normal text-slate-500">{unit}</span> : null}
      </p>
      {!hideDelta ? (
        <div className="mt-2 flex items-center gap-1 text-xs">
          {direction === 'up' && (
            <span className="inline-flex items-center gap-0.5 text-emerald-600 dark:text-emerald-400">
              <ArrowUp className="h-3 w-3" />
              {Math.abs(deltaPct ?? 0).toFixed(2)}%
            </span>
          )}
          {direction === 'down' && (
            <span className="inline-flex items-center gap-0.5 text-rose-600 dark:text-rose-400">
              <ArrowDown className="h-3 w-3" />
              {Math.abs(deltaPct ?? 0).toFixed(2)}%
            </span>
          )}
          {direction === 'flat' && (
            <span className="inline-flex items-center gap-0.5 text-slate-500">
              <Minus className="h-3 w-3" />
              0%
            </span>
          )}
          {direction == null && (
            <span className="text-slate-400">vs prior period: —</span>
          )}
          {direction != null && (
            <span className="text-slate-400">vs prior period</span>
          )}
        </div>
      ) : null}
    </div>
  );
}
