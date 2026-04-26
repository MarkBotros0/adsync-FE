'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { competitorAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import type { CompetitorActorKey } from '@/lib/types';

interface UseFilteredSummary<TSummary> {
  summary: TSummary | null;
  loading: boolean;
  refreshing: boolean;
  error: string | null;
  refresh: () => void;
}

/** Debounced server-side summary fetcher.
 *
 *  Posts the filter spec to ``/competitors/{id}/actors/{actor_key}/summary``
 *  whenever ``filters`` changes (debounced ~250ms) and exposes the latest
 *  pandas-computed summary. ``signal`` increments are used by the caller to
 *  force a refetch (e.g. after a scrape completes). Cached client-side per
 *  (filters, signal) tuple via JSON-string memoisation.
 */
export function useFilteredSummary<TSummary>(
  competitorId: number,
  actorKey: CompetitorActorKey,
  filters: object | null,
  /** Bumped to force a refetch (e.g. after a fresh scrape completes). */
  signal: number = 0,
  enabled: boolean = true,
  debounceMs: number = 250,
): UseFilteredSummary<TSummary> {
  const { token } = useBrandAuthContext();
  const [summary, setSummary] = useState<TSummary | null>(null);
  const [loading, setLoading] = useState<boolean>(false);
  const [refreshing, setRefreshing] = useState<boolean>(false);
  const [error, setError] = useState<string | null>(null);
  const timerRef = useRef<number | null>(null);
  const lastKeyRef = useRef<string | null>(null);
  const cacheRef = useRef<Map<string, TSummary>>(new Map());

  const fetcher = useCallback(
    async (spec: object | null) => {
      if (!token || !enabled) return;
      const cacheKey = `${signal}::${JSON.stringify(spec ?? {})}`;
      if (cacheRef.current.has(cacheKey)) {
        setSummary(cacheRef.current.get(cacheKey) ?? null);
        setRefreshing(false);
        setLoading(false);
        return;
      }
      const isInitial = summary === null;
      if (isInitial) setLoading(true);
      else setRefreshing(true);
      try {
        const res = await competitorAPI.actorSummary<TSummary>(
          token,
          competitorId,
          actorKey,
          spec as Record<string, unknown> | null,
        );
        const next = res.data.data.summary;
        cacheRef.current.set(cacheKey, next);
        setSummary(next);
        setError(null);
      } catch (err) {
        setError(extractMessage(err));
      } finally {
        setLoading(false);
        setRefreshing(false);
      }
    },
    [token, competitorId, actorKey, enabled, signal, summary],
  );

  // Reset cache when signal bumps (data has changed server-side).
  useEffect(() => {
    cacheRef.current.clear();
  }, [signal]);

  useEffect(() => {
    if (!enabled) return;
    const key = JSON.stringify({ filters, signal });
    if (key === lastKeyRef.current) return;
    lastKeyRef.current = key;
    if (timerRef.current) window.clearTimeout(timerRef.current);
    timerRef.current = window.setTimeout(() => {
      void fetcher(filters);
    }, debounceMs);
    return () => {
      if (timerRef.current) window.clearTimeout(timerRef.current);
    };
  }, [filters, signal, enabled, debounceMs, fetcher]);

  const refresh = useCallback(() => {
    cacheRef.current.clear();
    void fetcher(filters);
  }, [fetcher, filters]);

  return { summary, loading, refreshing, error, refresh };
}

function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = (err as { response?: { data?: { detail?: string; message?: string } } }).response;
    if (res?.data?.detail) return res.data.detail;
    if (res?.data?.message) return res.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Failed to load summary';
}
