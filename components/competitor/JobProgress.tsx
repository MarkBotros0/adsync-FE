'use client';

import { useEffect, useState } from 'react';
import type { CompetitorJobStatus } from '@/lib/types';

interface JobProgressProps {
  status: CompetitorJobStatus;
  done: number;
  total: number;
  failed: number;
  startedAt: string | null;
  finishedAt: string | null;
  /** When true, render a compact single-line variant for tables. */
  compact?: boolean;
}

export function JobProgress({
  status,
  done,
  total,
  failed,
  startedAt,
  finishedAt,
  compact = false,
}: JobProgressProps) {
  const elapsed = useElapsedSeconds(startedAt, finishedAt, status);
  const percent = total > 0 ? Math.min(100, Math.round(((done + failed) / total) * 100)) : 0;
  const isActive = status === 'pending' || status === 'running';

  if (compact) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <div className="relative h-1.5 w-24 overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
          <div
            className={`absolute inset-y-0 left-0 transition-all duration-500 ${barColor(status)}`}
            style={{ width: `${percent}%` }}
          />
        </div>
        <span className="text-slate-500 dark:text-slate-400 tabular-nums">
          {done + failed}/{total}
        </span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-2">
      <div className="flex items-center justify-between text-xs text-slate-600 dark:text-slate-300">
        <span className="font-medium">
          {done + failed} of {total} sources scraped
          {failed > 0 && (
            <span className="text-amber-600 dark:text-amber-400"> · {failed} failed</span>
          )}
        </span>
        {isActive && elapsed !== null && (
          <span className="tabular-nums text-slate-500 dark:text-slate-400">
            {formatElapsed(elapsed)}
          </span>
        )}
      </div>
      <div className="relative h-2 w-full overflow-hidden rounded-full bg-slate-200 dark:bg-slate-800">
        <div
          className={`absolute inset-y-0 left-0 transition-all duration-500 ${barColor(status)}`}
          style={{ width: `${percent}%` }}
        />
      </div>
    </div>
  );
}

function barColor(status: CompetitorJobStatus): string {
  switch (status) {
    case 'pending':
      return 'bg-slate-400';
    case 'running':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-emerald-500';
    case 'partial':
      return 'bg-amber-500';
    case 'failed':
      return 'bg-rose-500';
  }
}

function useElapsedSeconds(
  startedAt: string | null,
  finishedAt: string | null,
  status: CompetitorJobStatus,
): number | null {
  const [now, setNow] = useState(() => Date.now());

  useEffect(() => {
    if (status !== 'pending' && status !== 'running') return;
    const id = setInterval(() => setNow(Date.now()), 1000);
    return () => clearInterval(id);
  }, [status]);

  if (!startedAt) return null;
  const start = Date.parse(startedAt);
  if (Number.isNaN(start)) return null;
  const end = finishedAt ? Date.parse(finishedAt) : now;
  return Math.max(0, Math.floor((end - start) / 1000));
}

function formatElapsed(seconds: number): string {
  if (seconds < 60) return `${seconds}s`;
  const mins = Math.floor(seconds / 60);
  const secs = seconds % 60;
  return `${mins}m ${secs}s`;
}
