'use client';

import { useState } from 'react';
import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CompetitorActorStatus } from '@/lib/types';

interface ActorTabSkeletonProps {
  status: CompetitorActorStatus;
  actorLabel: string;
  description: string;
  error?: string | null;
  /** Optional retry handler — when provided, a "Retry this section" button is shown on failure. */
  onRetry?: () => Promise<void> | void;
}

export function ActorTabSkeleton({
  status,
  actorLabel,
  description,
  error,
  onRetry,
}: ActorTabSkeletonProps) {
  const [retrying, setRetrying] = useState(false);

  const handleRetry = async () => {
    if (!onRetry || retrying) return;
    setRetrying(true);
    try {
      await onRetry();
    } finally {
      setRetrying(false);
    }
  };

  if (status === 'failed') {
    return (
      <div className="rounded-xl border border-rose-200 bg-rose-50 p-5 text-sm dark:border-rose-500/30 dark:bg-rose-500/10">
        <div className="font-semibold text-rose-700 dark:text-rose-300">
          {actorLabel} scrape failed
        </div>
        <p className="mt-1 break-words text-rose-600 dark:text-rose-200/90">
          {error ?? 'Something went wrong while scraping this source.'}
        </p>

        {onRetry && (
          <div className="mt-4 flex flex-wrap items-center gap-3">
            <Button
              variant="outline"
              size="sm"
              onClick={handleRetry}
              disabled={retrying}
              aria-busy={retrying}
            >
              <RefreshCw className={`h-4 w-4 ${retrying ? 'animate-spin' : ''}`} />
              {retrying ? 'Retrying…' : 'Retry this section'}
            </Button>
          </div>
        )}
      </div>
    );
  }

  // pending / running — friendly skeleton
  const shimmer = 'animate-pulse bg-slate-100 dark:bg-dk-raised/60';
  return (
    <div className="space-y-4">
      <div className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-dk-border dark:bg-dk-surface">
        <div className="flex items-start gap-3">
          <div className={`h-10 w-10 shrink-0 rounded-lg ${shimmer}`} />
          <div className="flex-1 space-y-2">
            <div className={`h-3.5 w-1/3 rounded ${shimmer}`} />
            <div className={`h-3 w-2/3 rounded ${shimmer}`} />
          </div>
        </div>
        <p className="mt-4 text-sm text-slate-500 dark:text-slate-400">
          Scraping <span className="font-medium">{actorLabel}</span> — {description}
        </p>
      </div>
      <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="rounded-xl border border-slate-200 bg-white p-4 dark:border-dk-border dark:bg-dk-surface"
          >
            <div className={`h-32 w-full rounded ${shimmer}`} />
            <div className={`mt-3 h-3.5 w-3/4 rounded ${shimmer}`} />
            <div className={`mt-2 h-3 w-1/2 rounded ${shimmer}`} />
          </div>
        ))}
      </div>
    </div>
  );
}
