'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { usageAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import type { BrandUsage } from '@/lib/types';

interface UseBrandUsage {
  usage: BrandUsage | null;
  loading: boolean;
  error: string | null;
  refresh: () => Promise<void>;
}

/** Polls the brand usage endpoint and exposes the latest snapshot. */
export function useBrandUsage(pollIntervalMs: number | null = null): UseBrandUsage {
  const { token, isLoading: authLoading } = useBrandAuthContext();
  const [usage, setUsage] = useState<BrandUsage | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const intervalRef = useRef<number | null>(null);

  const refresh = useCallback(async () => {
    if (!token) return;
    try {
      const res = await usageAPI.brandCurrent(token);
      setUsage(res.data.data);
      setError(null);
    } catch (err) {
      setError(extractMessage(err));
    } finally {
      setLoading(false);
    }
  }, [token]);

  useEffect(() => {
    if (authLoading) return;
    void refresh();
  }, [authLoading, refresh]);

  useEffect(() => {
    if (!pollIntervalMs || !token) return;
    intervalRef.current = window.setInterval(() => {
      void refresh();
    }, pollIntervalMs);
    return () => {
      if (intervalRef.current) window.clearInterval(intervalRef.current);
    };
  }, [pollIntervalMs, token, refresh]);

  return { usage, loading, error, refresh };
}

function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = (err as { response?: { data?: { detail?: string; message?: string } } }).response;
    if (res?.data?.detail) return res.data.detail;
    if (res?.data?.message) return res.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Failed to load usage';
}
