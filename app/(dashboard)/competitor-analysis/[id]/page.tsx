'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { useParams, useRouter } from 'next/navigation';
import Link from 'next/link';
import { ArrowLeft, Trash2, SlidersHorizontal } from 'lucide-react';
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
  Competitor,
  CompetitorActorKey,
  CompetitorActorResult,
  CompetitorActorStatus,
  CompetitorTarget,
  FacebookAdResult,
  GooglePlaceResult,
  GoogleSearchData,
  InstagramData,
  TikTokData,
  WebsitePageResult,
} from '@/lib/types';
import { BudgetBanner } from '@/components/competitor/BudgetBanner';
import { EditTargetsDialog } from '@/components/competitor/EditTargetsDialog';
import { StatusPill } from '@/components/competitor/StatusPill';
import { AdsTab } from '@/components/competitor/tabs/AdsTab';
import { InstagramTab } from '@/components/competitor/tabs/InstagramTab';
import { TikTokTab } from '@/components/competitor/tabs/TikTokTab';
import { SerpTab } from '@/components/competitor/tabs/SerpTab';
import { WebsiteTab } from '@/components/competitor/tabs/WebsiteTab';
import { PlacesTab } from '@/components/competitor/tabs/PlacesTab';
import { useActorResults } from '@/hooks/useActorResults';
import { useBrandUsage } from '@/hooks/useBrandUsage';
import { EchofoldSpinner } from '@/components/brand/echofold-spinner';

export default function CompetitorDetailPage() {
  const params = useParams<{ id: string }>();
  const router = useRouter();
  const competitorId = Number(params.id);
  const { token, isLoading: authLoading } = useBrandAuthContext();

  const [competitor, setCompetitor] = useState<Competitor | null>(null);
  const [overviewStatuses, setOverviewStatuses] = useState<
    Record<CompetitorActorKey, CompetitorActorStatus>
  >({
    facebook_ads: 'idle',
    instagram: 'idle',
    tiktok: 'idle',
    google_search: 'idle',
    website: 'idle',
    google_places: 'idle',
  });
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [activeTab, setActiveTab] = useState<CompetitorActorKey>('facebook_ads');
  const [editOpen, setEditOpen] = useState(false);
  const [actorSignal, setActorSignal] = useState<Record<CompetitorActorKey, number>>({
    facebook_ads: 0,
    instagram: 0,
    tiktok: 0,
    google_search: 0,
    website: 0,
    google_places: 0,
  });

  const { usage, refresh: refreshUsage } = useBrandUsage(60_000);

  const loadOverview = useCallback(async () => {
    if (!token || Number.isNaN(competitorId)) return;
    setError(null);
    try {
      const res = await competitorAPI.results(token, competitorId);
      const payload = res.data.data;
      setCompetitor(payload.competitor);
      const next: Record<CompetitorActorKey, CompetitorActorStatus> = {
        facebook_ads: 'idle',
        instagram: 'idle',
        tiktok: 'idle',
        google_search: 'idle',
        website: 'idle',
        google_places: 'idle',
      };
      let mutated = false;
      for (const key of COMPETITOR_ACTOR_KEYS) {
        const r = payload.results[key];
        next[key] = r?.status ?? 'idle';
        if (r?.status === 'completed' && overviewStatuses[key] !== 'completed') {
          mutated = true;
        }
      }
      setOverviewStatuses(next);
      if (mutated) {
        // A scrape just finished — bump the signals for any actors whose status flipped
        // to completed so child tabs re-fetch their data + filtered summary.
        setActorSignal((prev) => {
          const out = { ...prev };
          for (const key of COMPETITOR_ACTOR_KEYS) {
            if (
              payload.results[key]?.status === 'completed' &&
              overviewStatuses[key] !== 'completed'
            ) {
              out[key] = (out[key] ?? 0) + 1;
            }
          }
          return out;
        });
        void refreshUsage();
      }
    } catch (err) {
      const message = extractMessage(err);
      setError(message);
    } finally {
      setLoading(false);
    }
  }, [token, competitorId, overviewStatuses, refreshUsage]);

  useEffect(() => {
    if (authLoading) return;
    void loadOverview();
  }, [authLoading, loadOverview]);

  // Poll overview while any actor is active.
  const anyActive = useMemo(
    () =>
      Object.values(overviewStatuses).some(
        (s) => s === 'pending' || s === 'running',
      ),
    [overviewStatuses],
  );

  useEffect(() => {
    if (!anyActive || !token || !competitor) return;
    const startMs = competitor.last_job?.started_at
      ? Date.parse(competitor.last_job.started_at)
      : Date.now();
    if (Date.now() - startMs > COMPETITOR_JOB_POLL_MAX_DURATION_MS) return;
    const id = setInterval(() => {
      void loadOverview();
    }, COMPETITOR_JOB_POLL_INTERVAL_MS);
    return () => clearInterval(id);
  }, [anyActive, token, loadOverview, competitor]);

  const handleDelete = useCallback(async () => {
    if (!token || !competitor) return;
    if (!confirm(`Delete "${competitor.name}"? This will also remove its scrape history.`)) return;
    try {
      await competitorAPI.delete(token, competitorId);
      toast.success('Competitor deleted');
      router.push('/competitor-analysis');
    } catch (err) {
      toast.error(extractMessage(err));
    }
  }, [token, competitorId, competitor, router]);

  const handleTargetsSaved = useCallback(
    (updated: CompetitorTarget[]) => {
      setCompetitor((prev) => (prev ? { ...prev, targets: updated } : prev));
    },
    [],
  );

  const handleRunStarted = useCallback(async () => {
    await loadOverview();
    await refreshUsage();
  }, [loadOverview, refreshUsage]);

  const targets = competitor?.targets ?? [];
  const targetByKey = useMemo<Record<CompetitorActorKey, CompetitorTarget | null>>(() => {
    const out: Record<CompetitorActorKey, CompetitorTarget | null> = {
      facebook_ads: null,
      instagram: null,
      tiktok: null,
      google_search: null,
      website: null,
      google_places: null,
    };
    for (const t of targets) out[t.actor_key] = t;
    return out;
  }, [targets]);

  // Lazy per-actor data load. Only the active tab's data is fetched.
  const adsResults = useActorResults<FacebookAdResult[]>(
    competitorId,
    'facebook_ads',
    activeTab === 'facebook_ads',
    actorSignal.facebook_ads,
  );
  const igResults = useActorResults<InstagramData>(
    competitorId,
    'instagram',
    activeTab === 'instagram',
    actorSignal.instagram,
  );
  const ttResults = useActorResults<TikTokData>(
    competitorId,
    'tiktok',
    activeTab === 'tiktok',
    actorSignal.tiktok,
  );
  const serpResults = useActorResults<GoogleSearchData>(
    competitorId,
    'google_search',
    activeTab === 'google_search',
    actorSignal.google_search,
  );
  const webResults = useActorResults<WebsitePageResult[]>(
    competitorId,
    'website',
    activeTab === 'website',
    actorSignal.website,
  );
  const placesResults = useActorResults<GooglePlaceResult[]>(
    competitorId,
    'google_places',
    activeTab === 'google_places',
    actorSignal.google_places,
  );

  if (loading || authLoading) {
    return <DetailSkeleton />;
  }

  if (error || !competitor) {
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
            <h3 className="font-semibold text-rose-700 dark:text-rose-300">Couldn’t load this competitor</h3>
            <p className="mt-1 text-sm text-rose-600 dark:text-rose-200/80">
              {error ?? 'Competitor not found'}
            </p>
            <Button variant="outline" size="sm" className="mt-4" onClick={loadOverview}>
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
              {initials(competitor.name)}
            </span>
            <div className="min-w-0">
              <h1 className="truncate text-xl font-semibold text-slate-900 sm:text-2xl dark:text-white">
                {competitor.name}
              </h1>
              <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-slate-500 sm:text-sm dark:text-slate-400">
                {competitor.last_job && <StatusPill status={competitor.last_job.status} />}
                <span>
                  {targets.filter((t) => t.is_enabled && t.target_value).length}/6 targets configured
                </span>
              </div>
            </div>
          </div>

          <div className="flex items-center gap-2 md:shrink-0">
            <Button variant="outline" size="sm" onClick={() => setEditOpen(true)} className="flex-1 md:flex-none">
              <SlidersHorizontal className="h-4 w-4" />
              <span className="hidden sm:inline">Edit targets</span>
              <span className="sm:hidden">Targets</span>
            </Button>
            <Button variant="outline" size="sm" onClick={handleDelete} className="flex-1 md:flex-none">
              <Trash2 className="h-4 w-4 text-rose-500" />
              <span className="hidden sm:inline">Delete</span>
            </Button>
          </div>
        </div>

        {usage && (usage.budget.will_warn || usage.budget.will_block) && (
          <div className="mt-4">
            <BudgetBanner usage={usage} />
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
                const status = overviewStatuses[key];
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

          <div className="mt-4 space-y-4">
            <TabsContent value="facebook_ads">
              <AdsTab
                competitorId={competitorId}
                result={mergeStatus(adsResults.result, overviewStatuses.facebook_ads)}
                target={targetByKey.facebook_ads}
                usage={usage}
                signal={actorSignal.facebook_ads}
                onRunStarted={handleRunStarted}
              />
            </TabsContent>
            <TabsContent value="instagram">
              <InstagramTab
                competitorId={competitorId}
                result={mergeStatus(igResults.result, overviewStatuses.instagram)}
                target={targetByKey.instagram}
                usage={usage}
                signal={actorSignal.instagram}
                onRunStarted={handleRunStarted}
              />
            </TabsContent>
            <TabsContent value="tiktok">
              <TikTokTab
                competitorId={competitorId}
                result={mergeStatus(ttResults.result, overviewStatuses.tiktok)}
                target={targetByKey.tiktok}
                usage={usage}
                signal={actorSignal.tiktok}
                onRunStarted={handleRunStarted}
              />
            </TabsContent>
            <TabsContent value="google_search">
              <SerpTab
                competitorId={competitorId}
                result={mergeStatus(serpResults.result, overviewStatuses.google_search)}
                target={targetByKey.google_search}
                usage={usage}
                onRunStarted={handleRunStarted}
              />
            </TabsContent>
            <TabsContent value="website">
              <WebsiteTab
                competitorId={competitorId}
                result={mergeStatus(webResults.result, overviewStatuses.website)}
                target={targetByKey.website}
                usage={usage}
                onRunStarted={handleRunStarted}
              />
            </TabsContent>
            <TabsContent value="google_places">
              <PlacesTab
                competitorId={competitorId}
                result={mergeStatus(placesResults.result, overviewStatuses.google_places)}
                target={targetByKey.google_places}
                usage={usage}
                onRunStarted={handleRunStarted}
              />
            </TabsContent>
          </div>
        </Tabs>
      </main>

      <EditTargetsDialog
        open={editOpen}
        competitorId={competitorId}
        competitorName={competitor.name}
        initialTargets={targets}
        onOpenChange={setEditOpen}
        onSaved={handleTargetsSaved}
      />
    </div>
  );
}

/** Merge the lazy-loaded actor result with the latest overview status —
 *  ensures the tab shows "running" immediately after a run is queued, even if
 *  the heavy ``data`` payload hasn't reloaded yet. */
function mergeStatus<T>(
  result: CompetitorActorResult<T> | null,
  fallbackStatus: CompetitorActorStatus,
): CompetitorActorResult<T> | null {
  if (!result) {
    return {
      actor_key: 'facebook_ads', // overwritten by tab; status-only fallback
      status: fallbackStatus,
      summary: null,
      data: null,
      error: null,
      started_at: null,
      finished_at: null,
    } as CompetitorActorResult<T>;
  }
  // If the overview just observed a freshly-queued or running run, trust the
  // overview over the cached per-actor row (which may still show the previous
  // terminal state). Don't override with the lighter `idle` fallback.
  if (
    fallbackStatus !== result.status &&
    (fallbackStatus === 'pending' || fallbackStatus === 'running')
  ) {
    return { ...result, status: fallbackStatus, error: null };
  }
  return result;
}

function DetailSkeleton() {
  return (
    <div className="flex h-full items-center justify-center bg-slate-50 dark:bg-dk-bg">
      <EchofoldSpinner size="md" label="Loading competitor" />
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
