'use client';

import { useCallback, useEffect, useState } from 'react';
import { competitorAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import type {
  CompetitorActorKey,
  CompetitorActorResult,
  CompetitorJobSummary,
} from '@/lib/types';

interface UseActorResults<TData> {
  result: CompetitorActorResult<TData> | null;
  job: CompetitorJobSummary | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** Lazy fetch the heavy ``data`` payload for one actor.
 *
 *  The detail page only fetches this when the tab is active; status updates
 *  for inactive tabs come from the lightweight ``/results`` overview poll.
 */
export function useActorResults<TData>(
  competitorId: number,
  actorKey: CompetitorActorKey,
  enabled: boolean,
  /** Bumped to force a refetch (after a scrape completes). */
  signal: number = 0,
): UseActorResults<TData> {
  const { token } = useBrandAuthContext();
  const [result, setResult] = useState<CompetitorActorResult<TData> | null>(null);
  const [job, setJob] = useState<CompetitorJobSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);

  const refresh = useCallback(async () => {
    if (!token || !enabled) return;
    setLoading(true);
    try {
      const res = await competitorAPI.actorResults<TData>(token, competitorId, actorKey);
      setResult(res.data.data.result);
      setJob(res.data.data.job);
      setError(null);
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token, competitorId, actorKey, enabled]);

  useEffect(() => {
    if (!enabled) return;
    void refresh();
  }, [enabled, signal, refresh]);

  return { result, job, loading, error, refresh };
}

function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = (err as { response?: { data?: { detail?: string; message?: string } } }).response;
    if (res?.data?.detail) return res.data.detail;
    if (res?.data?.message) return res.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Failed to load results';
}
