'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2 } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { Tabs, TabsList, TabsTrigger, TabsContent } from '@/components/ui/tabs';
import { competitorAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import {
  COMPETITOR_ACTOR_KEYS,
  COMPETITOR_ACTOR_LABELS,
  COMPETITOR_JOB_POLL_INTERVAL_MS,
  COMPETITOR_JOB_POLL_MAX_DURATION_MS,
} from '@/lib/constants';
import type {
  CompetitorActorKey,
  CompetitorResultsResponse,
} from '@/lib/types';
import { JobProgress } from '@/components/competitor/JobProgress';
import { RefreshButton } from '@/components/competitor/RefreshButton';
import { StatusPill } from '@/components/competitor/StatusPill';
import { AdsTab } from '@/components/competitor/tabs/AdsTab';
import { InstagramTab } from '@/components/competitor/tabs/InstagramTab';
import { TikTokTab } from '@/components/competitor/tabs/TikTokTab';
import { SerpTab } from '@/components/competitor/tabs/SerpTab';
import { WebsiteTab } from '@/components/competitor/tabs/WebsiteTab';
import { PlacesTab } from '@/components/competitor/tabs/PlacesTab';

export default function CompetitorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const competitorId = Number(params.id);
  const { token, isLoading: authLoading } = useBrandAuthContext();

  const [data, setData] = useState<CompetitorResultsResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CompetitorActorKey>('facebook_ads');

  const loadResults = useCallback(async () => {
    if (!token || Number.isNaN(competitorId)) return;
    setError(null);
    try {
      const res = await competitorAPI.results(token, competitorId);
      setData(res.data.data);
    } catch (err) {
      const message = extractMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, competitorId]);

  useEffect(() => {
    if (authLoading) return;
    void loadResults();
  }, [authLoading, loadResults]);

  // Poll while a job is active OR any individual actor is still running.
  // (Single-actor retries leave the job in "completed" but flip one result row
  // back to "running", so we can't gate polling on job status alone.)
  const job = data?.job ?? null;
  const results = data?.results;
  const anyActorActive = !!results && COMPETITOR_ACTOR_KEYS.some((k) => {
    const s = results[k]?.status;
    return s === 'pending' || s === 'running';
  });
  const jobActive = (() => {
    if (!job || (job.status !== 'pending' && job.status !== 'running')) return false;
    const startMs = job.started_at
      ? Date.parse(job.started_at)
      : Date.parse(job.created_at);
    if (Number.isNaN(startMs)) return true;
    return Date.now() - startMs < COMPETITOR_JOB_POLL_MAX_DURATION_MS;
  })();
  const activeJob = jobActive || anyActorActive;

  useEffect(() => {
    if (!activeJob || !token) return;
    const id = setInterval(() => {
      void loadResults();
    }, COMPETITOR_JOB_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [activeJob, token, loadResults]);

  // Re-fetch a couple of times shortly after kicking off a refresh/retry — the
  // backend writes job/result rows asynchronously, so the first reload right
  // after the API call often still shows the old "completed" state.
  const reloadAfterAction = useCallback(async () => {
    await loadResults();
    setTimeout(() => void loadResults(), 800);
    setTimeout(() => void loadResults(), 2500);
  }, [loadResults]);

  const handleRefresh = useCallback(async () => {
    if (!token) return;
    try {
      await competitorAPI.refresh(token, competitorId);
      toast.success('Refresh started');
      await reloadAfterAction();
    } catch (err) {
      toast.error(extractMessage(err));
    }
  }, [token, competitorId, reloadAfterAction]);

  const handleRetryActor = useCallback(
    async (actorKey: CompetitorActorKey) => {
      if (!token) return;
      try {
        await competitorAPI.retryActor(token, competitorId, actorKey);
        toast.success(`Retrying ${actorKey.replace('_', ' ')}…`);
        await reloadAfterAction();
      } catch (err) {
        toast.error(extractMessage(err));
      }
    },
    [token, competitorId, reloadAfterAction],
  );

  const handleDelete = useCallback(async () => {
    if (!token) return;
    if (!data?.competitor) return;
    if (!confirm(`Delete "${data.competitor.name}"? This will also remove its scrape history.`)) return;
    try {
      await competitorAPI.delete(token, competitorId);
      toast.success('Competitor deleted');
      router.push('/competitor-analysis');
    } catch (err) {
      toast.error(extractMessage(err));
    }
  }, [token, competitorId, data?.competitor, router]);

  // Auto-switch to a non-pending tab once results arrive.
  useEffect(() => {
    if (!results) return;
    const completed = COMPETITOR_ACTOR_KEYS.find((k) => results[k].status === 'completed');
    if (completed) setActiveTab(completed);
  }, [results]);

  const headerTitle = useMemo(() => data?.competitor?.name ?? 'Competitor', [data]);

  if (loading || authLoading) {
    return <DetailSkeleton />;
  }

  if (error || !data) {
    return (
      <div className="flex h-full flex-col bg-slate-50 dark:bg-dk-bg">
        <div className="px-5 py-6 md:px-8">
          <Link
            href="/competitor-analysis"
            className="inline-flex items-center gap-1 text-sm text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
          >
            <ArrowLeft className="h-4 w-4" /> Back to competitors
          </Link>
        </div>
        <div className="px-5 md:px-8">
          <div className="rounded-xl border border-rose-200 bg-rose-50 p-6 text-center dark:border-rose-500/30 dark:bg-rose-500/10">
            <h3 className="font-semibold text-rose-700 dark:text-rose-300">Couldn’t load results</h3>
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-200/80">
              {error ?? 'Competitor not found'}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadResults}>
              Try again
            </Button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="flex h-full flex-col overflow-y-auto bg-slate-50 dark:bg-dk-bg">
      <header className="border-b border-slate-200 bg-white px-4 py-4 sm:px-6 sm:py-5 dark:border-dk-border dark:bg-dk-surface md:px-8">
        <Link
          href="/competitor-analysis"
          className="inline-flex items-center gap-1 text-xs font-medium text-slate-500 hover:text-slate-900 dark:text-slate-400 dark:hover:text-white"
        >
          <ArrowLeft className="h-3.5 w-3.5" /> Back to competitors
        </Link>

        <div className="mt-3 flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
          <div className="flex items-start gap-3 min-w-0">
            <span className="grid h-11 w-11 shrink-0 place-items-center rounded-xl bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white shadow-md sm:h-12 sm:w-12 sm:text-base">
              {initials(headerTitle)}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">
                {headerTitle}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                {job && <StatusPill status={job.status} />}
                {job?.finished_at && (
                  <span className="truncate">
                    Last refreshed {new Date(job.finished_at).toLocaleString()}
                  </span>
                )}
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:shrink-0">
            <Button variant="outline" size="sm" onClick={handleDelete} className="flex-1 md:flex-none">
              <Trash2 className="h-4 w-4 text-rose-500" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
            <div className="flex-1 md:flex-none">
              <RefreshButton status={job?.status ?? null} onRefresh={handleRefresh} size="default" />
            </div>
          </div>
        </div>

        {job && (job.status === 'pending' || job.status === 'running') && (
          <div className="mt-5">
            <JobProgress
              status={job.status}
              done={job.actors_done}
              total={job.actors_total}
              failed={job.actors_failed}
              startedAt={job.started_at}
              finishedAt={job.finished_at}
            />
          </div>
        )}
      </header>

      <main className="flex-1 px-4 py-4 sm:px-6 sm:py-6 md:px-8 md:py-8">
        <Tabs
          value={activeTab}
          onValueChange={(v) => setActiveTab(v as CompetitorActorKey)}
        >
          <div className="overflow-x-auto pb-2">
            <TabsList className="bg-slate-100 dark:bg-dk-surface">
              {COMPETITOR_ACTOR_KEYS.map((key) => {
                const status = results?.[key].status ?? 'pending';
                return (
                  <TabsTrigger key={key} value={key}>
                    <span className="flex items-center gap-2">
                      {COMPETITOR_ACTOR_LABELS[key]}
                      <span
                        aria-hidden
                        className={`h-1.5 w-1.5 rounded-full ${dotColor(status)}`}
                      />
                    </span>
                  </TabsTrigger>
                );
              })}
            </TabsList>
          </div>

          <div className="mt-4">
            <TabsContent value="facebook_ads">
              {results && (
                <AdsTab
                  result={results.facebook_ads}
                  onRetry={() => handleRetryActor('facebook_ads')}
                />
              )}
            </TabsContent>
            <TabsContent value="instagram">
              {results && (
                <InstagramTab
                  result={results.instagram}
                  onRetry={() => handleRetryActor('instagram')}
                />
              )}
            </TabsContent>
            <TabsContent value="tiktok">
              {results && (
                <TikTokTab
                  result={results.tiktok}
                  onRetry={() => handleRetryActor('tiktok')}
                />
              )}
            </TabsContent>
            <TabsContent value="google_search">
              {results && (
                <SerpTab
                  result={results.google_search}
                  onRetry={() => handleRetryActor('google_search')}
                />
              )}
            </TabsContent>
            <TabsContent value="website">
              {results && (
                <WebsiteTab
                  result={results.website}
                  onRetry={() => handleRetryActor('website')}
                />
              )}
            </TabsContent>
            <TabsContent value="google_places">
              {results && (
                <PlacesTab
                  result={results.google_places}
                  onRetry={() => handleRetryActor('google_places')}
                />
              )}
            </TabsContent>
          </div>
        </Tabs>
      </main>
    </div>
  );
}

function DetailSkeleton() {
  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-dk-bg">
      <div className="h-32 animate-pulse border-b border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface" />
      <div className="flex-1 space-y-3 px-5 py-6 md:px-8">
        <div className="h-10 w-1/2 animate-pulse rounded-md bg-slate-100 dark:bg-dk-surface" />
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-3">
          {[0, 1, 2, 3, 4, 5].map((i) => (
            <div
              key={i}
              className="h-48 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface"
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function dotColor(status: string): string {
  switch (status) {
    case 'completed':
      return 'bg-emerald-500';
    case 'running':
      return 'bg-blue-500 animate-pulse';
    case 'failed':
      return 'bg-rose-500';
    default:
      return 'bg-slate-300 dark:bg-slate-600';
  }
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
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
