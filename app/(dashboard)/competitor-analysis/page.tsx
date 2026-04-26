'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { Plus, Crosshair } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { CompetitorListTable } from '@/components/competitor/CompetitorListTable';
import { AddCompetitorDialog } from '@/components/competitor/AddCompetitorDialog';
import { EmptyState } from '@/components/competitor/EmptyState';
import { competitorAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import {
  COMPETITOR_JOB_POLL_INTERVAL_MS,
  COMPETITOR_JOB_POLL_MAX_DURATION_MS,
} from '@/lib/constants';
import type { Competitor } from '@/lib/types';

export default function CompetitorAnalysisPage() {
  const { token, isLoading: authLoading } = useBrandAuthContext();
  const [competitors, setCompetitors] = useState<Competitor[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [dialogOpen, setDialogOpen] = useState(false);

  const loadList = useCallback(async () => {
    if (!token) return;
    setError(null);
    try {
      const res = await competitorAPI.list(token);
      setCompetitors(res.data.data.competitors);
    } catch (err) {
      const message = err instanceof Error ? err.message : 'Failed to load competitors';
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token]);

  // Initial load.
  useEffect(() => {
    if (authLoading) return;
    if (!token) {
      setLoading(false);
      return;
    }
    void loadList();
  }, [authLoading, token, loadList]);

  // Poll while any competitor has a recently-started active job.
  // Cap polling at COMPETITOR_JOB_POLL_MAX_DURATION_MS to avoid hammering when a
  // job is wedged (e.g. server restarted mid-scrape).
  const hasActiveJob = useMemo(
    () =>
      competitors.some((c) => {
        const job = c.last_job;
        if (!job) return false;
        if (job.status !== 'pending' && job.status !== 'running') return false;
        const startMs = job.started_at
          ? Date.parse(job.started_at)
          : Date.parse(job.created_at);
        if (Number.isNaN(startMs)) return true;
        return Date.now() - startMs < COMPETITOR_JOB_POLL_MAX_DURATION_MS;
      }),
    [competitors],
  );

  useEffect(() => {
    if (!hasActiveJob || !token) return;
    const id = setInterval(() => {
      void loadList();
    }, COMPETITOR_JOB_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [hasActiveJob, token, loadList]);

  const handleRefresh = useCallback(
    async (competitor: Competitor) => {
      if (!token) return;
      try {
        await competitorAPI.refresh(token, competitor.id);
        toast.success(`Refreshing "${competitor.name}"`);
        await loadList();
      } catch (err) {
        const message = extractMessage(err);
        toast.error(message);
      }
    },
    [token, loadList],
  );

  const handleDelete = useCallback(
    async (competitor: Competitor) => {
      if (!token) return;
      if (!confirm(`Delete "${competitor.name}"? This will also remove its scrape history.`)) return;
      try {
        await competitorAPI.delete(token, competitor.id);
        toast.success(`Deleted "${competitor.name}"`);
        setCompetitors((prev) => prev.filter((c) => c.id !== competitor.id));
      } catch (err) {
        const message = extractMessage(err);
        toast.error(message);
      }
    },
    [token],
  );

  const handleCreated = useCallback((competitor: Competitor) => {
    setCompetitors((prev) => [competitor, ...prev]);
  }, []);

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-50 dark:bg-dk-bg">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5 dark:border-dk-border dark:bg-dk-surface md:px-8">
        <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3">
            <span className="grid h-10 w-10 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-md">
              <Crosshair className="h-5 w-5" />
            </span>
            <div className="min-w-0">
              <h1 className="text-lg font-semibold text-slate-900 sm:text-xl dark:text-white">
                Competitor Analysis
              </h1>
              <p className="text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                Facebook + Instagram ads, organic Instagram & TikTok, Google search, websites, and Maps reviews.
              </p>
            </div>
          </div>
          <Button
            onClick={() => {
              if (token) setDialogOpen(true);
            }}
            className="w-full md:w-auto"
          >
            <Plus className="h-4 w-4" />
            Add competitor
          </Button>
        </div>
      </header>

      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        {loading ? (
          <ListSkeleton />
        ) : error ? (
          <ErrorBlock message={error} onRetry={loadList} />
        ) : competitors.length === 0 ? (
          <EmptyState onAdd={() => setDialogOpen(true)} />
        ) : (
          <CompetitorListTable
            competitors={competitors}
            onRefresh={handleRefresh}
            onDelete={handleDelete}
          />
        )}
      </main>

      <AddCompetitorDialog
        open={dialogOpen}
        onOpenChange={setDialogOpen}
        onCreated={handleCreated}
      />
    </div>
  );
}

function ListSkeleton() {
  return (
    <div className="space-y-3">
      {[0, 1, 2].map((i) => (
        <div
          key={i}
          className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface"
        />
      ))}
    </div>
  );
}

function ErrorBlock({ message, onRetry }: { message: string; onRetry: () => void }) {
  return (
    <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-500/30 dark:bg-rose-500/10">
      <h3 className="font-semibold text-rose-700 dark:text-rose-300">
        Couldn’t load competitors
      </h3>
      <p className="mt-1 text-sm text-rose-600 dark:text-rose-200/80">{message}</p>
      <Button variant="outline" size="sm" className="mt-4" onClick={onRetry}>
        Try again
      </Button>
    </div>
  );
}

function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = (err as { response?: { data?: { detail?: string; message?: string } } }).response;
    if (res?.data?.detail) return res.data.detail;
    if (res?.data?.message) return res.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Something went wrong';
}
