import { ExternalLink } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import { proxyImage } from '@/lib/utils';
import type { CompetitorActorResult, FacebookAdResult } from '@/lib/types';

interface AdsTabProps {
  result: CompetitorActorResult<FacebookAdResult[]>;
  onRetry?: () => Promise<void> | void;
}

export function AdsTab({ result, onRetry }: AdsTabProps) {
  if (result.status !== 'completed') {
    return (
      <ActorTabSkeleton
        status={result.status}
        actorLabel={COMPETITOR_ACTOR_LABELS.facebook_ads}
        description={COMPETITOR_ACTOR_DESCRIPTIONS.facebook_ads}
        error={result.error}
        onRetry={onRetry}
      />
    );
  }

  const ads = result.data ?? [];
  if (ads.length === 0) {
    return (
      <EmptyTab
        title="No active ads found"
        description="This brand isn’t running any ads on Meta Ad Library that match the search."
      />
    );
  }

  return (
    <div className="grid gap-3 sm:grid-cols-2 sm:gap-4 xl:grid-cols-3">
      {ads.map((ad, idx) => (
        <article
          key={ad.id ?? idx}
          className="flex flex-col overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dk-border dark:bg-dk-surface"
        >
          {ad.media[0]?.url ? (
            // eslint-disable-next-line @next/next/no-img-element
            <img
              src={proxyImage(ad.media[0].url)}
              alt={ad.body ?? 'Ad creative'}
              className="aspect-video w-full object-cover"
              loading="lazy"
            />
          ) : (
            <div className="grid aspect-video w-full place-items-center bg-gradient-to-br from-slate-100 to-slate-200 text-slate-400 dark:from-dk-raised dark:to-dk-bg">
              No preview
            </div>
          )}
          <div className="flex flex-1 flex-col gap-3 p-4">
            <div className="flex items-center justify-between">
              <span className="truncate text-sm font-semibold text-slate-900 dark:text-white">
                {ad.page_name ?? 'Unknown page'}
              </span>
              {ad.is_active ? (
                <span className="rounded-full bg-emerald-100 px-2 py-0.5 text-xs font-medium text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                  Active
                </span>
              ) : (
                <span className="rounded-full bg-slate-100 px-2 py-0.5 text-xs font-medium text-slate-600 dark:bg-slate-700/50 dark:text-slate-300">
                  Inactive
                </span>
              )}
            </div>
            {ad.body && (
              <p className="line-clamp-4 text-sm text-slate-600 dark:text-slate-300">
                {ad.body}
              </p>
            )}
            <div className="mt-auto flex items-center justify-between pt-2 text-xs text-slate-500 dark:text-slate-400">
              <span>
                {formatDateRange(ad.start_date, ad.end_date)}
              </span>
              {ad.cta && (
                <span className="rounded-md bg-blue-50 px-2 py-0.5 font-medium text-blue-700 dark:bg-blue-500/15 dark:text-blue-300">
                  {ad.cta}
                </span>
              )}
            </div>
            {ad.link_url && (
              <a
                href={ad.link_url}
                target="_blank"
                rel="noopener noreferrer"
                className="inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
              >
                View destination <ExternalLink className="h-3 w-3" />
              </a>
            )}
          </div>
        </article>
      ))}
    </div>
  );
}

function formatDateRange(start: string | null, end: string | null): string {
  if (!start && !end) return '—';
  const fmt = (s: string | null) => {
    if (!s) return '';
    const d = new Date(s);
    if (Number.isNaN(d.getTime())) return s;
    return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
  };
  if (start && end) return `${fmt(start)} – ${fmt(end)}`;
  return fmt(start) || fmt(end);
}
