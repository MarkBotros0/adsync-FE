'use client';

import { AlertTriangle, CheckCircle2, Loader2 } from 'lucide-react';
import type { CompetitorActorResult, CompetitorActorStatus } from '@/lib/types';

interface RunStatusBannerProps {
  status: CompetitorActorStatus;
  /** Server-side error message — shown verbatim when status is failed. */
  error: string | null | undefined;
  /** ISO timestamp of the last terminal transition — surfaces "Last run …". */
  finishedAt: string | null | undefined;
  startedAt: string | null | undefined;
}

/** Compact status banner shown inside each tab's header card. Always visible
 *  so the user can see *why* a run failed without hunting in the body. */
export function RunStatusBanner({
  status,
  error,
  finishedAt,
  startedAt,
}: RunStatusBannerProps) {
  if (status === 'pending') return null;

  if (status === 'running') {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-blue-50 px-2 py-1 text-xs font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
        <Loader2 className="h-3 w-3 animate-spin" />
        <span>Scraping in progress{startedAt ? ` · started ${formatRelative(startedAt)}` : ''}</span>
      </div>
    );
  }

  if (status === 'completed') {
    return (
      <div className="mt-2 inline-flex items-center gap-1.5 rounded-md bg-emerald-50 px-2 py-1 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
        <CheckCircle2 className="h-3 w-3" />
        <span>Last run {finishedAt ? formatRelative(finishedAt) : 'completed'}</span>
      </div>
    );
  }

  // failed
  const message = error ?? 'The scraper failed unexpectedly.';
  return (
    <div className="mt-2 flex items-start gap-1.5 rounded-md bg-rose-50 px-2 py-1.5 text-xs text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
      <AlertTriangle className="mt-0.5 h-3 w-3 shrink-0" />
      <div>
        <span className="font-semibold">Last run failed{finishedAt ? ` · ${formatRelative(finishedAt)}` : ''}</span>
        <p className="mt-0.5 break-words opacity-90">{message}</p>
      </div>
    </div>
  );
}

/** Pull-out helper so tabs can pass a result without unwrapping. */
export function bannerPropsFromResult<T>(
  result: CompetitorActorResult<T> | null,
): RunStatusBannerProps {
  return {
    status: result?.status ?? 'pending',
    error: result?.error ?? null,
    finishedAt: result?.finished_at ?? null,
    startedAt: result?.started_at ?? null,
  };
}

function formatRelative(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '—';
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  return new Date(ts).toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}
