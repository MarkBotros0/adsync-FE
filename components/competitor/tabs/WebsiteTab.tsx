import { ExternalLink, FileText } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import type { CompetitorActorResult, WebsitePageResult } from '@/lib/types';

interface WebsiteTabProps {
  result: CompetitorActorResult<WebsitePageResult[]>;
  onRetry?: () => Promise<void> | void;
}

export function WebsiteTab({ result, onRetry }: WebsiteTabProps) {
  if (result.status !== 'completed') {
    return (
      <ActorTabSkeleton
        status={result.status}
        actorLabel={COMPETITOR_ACTOR_LABELS.website}
        description={COMPETITOR_ACTOR_DESCRIPTIONS.website}
        error={result.error}
        onRetry={onRetry}
      />
    );
  }

  const pages = result.data ?? [];
  if (pages.length === 0) {
    return (
      <EmptyTab
        title="No website content found"
        description="The website crawler didn’t return any pages. The site may be blocked or the SERP didn’t resolve a usable URL."
      />
    );
  }

  const homepage = pages.find((p) => isRoot(p.url ?? '')) ?? pages[0];

  return (
    <div className="space-y-6">
      {homepage && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-dk-border dark:bg-dk-surface">
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Homepage messaging
          </h3>
          {homepage.title && (
            <h4 className="text-lg font-semibold text-slate-900 dark:text-white">
              {homepage.title}
            </h4>
          )}
          {homepage.description && (
            <p className="mt-2 text-sm text-slate-600 dark:text-slate-300">
              {homepage.description}
            </p>
          )}
          {homepage.headings.length > 0 && (
            <div className="mt-4">
              <div className="text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
                Top headings
              </div>
              <ul className="mt-2 flex flex-wrap gap-2">
                {homepage.headings.map((h, i) => (
                  <li
                    key={i}
                    className="rounded-md bg-slate-100 px-2 py-1 text-xs text-slate-700 dark:bg-dk-raised dark:text-slate-200"
                  >
                    {h}
                  </li>
                ))}
              </ul>
            </div>
          )}
          {homepage.url && (
            <a
              href={homepage.url}
              target="_blank"
              rel="noopener noreferrer"
              className="mt-4 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
            >
              {homepage.url} <ExternalLink className="h-3 w-3" />
            </a>
          )}
        </section>
      )}

      <section>
        <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
          Crawled pages ({pages.length})
        </h3>
        <ul className="grid gap-3 sm:grid-cols-2">
          {pages.map((p, i) => (
            <li
              key={(p.url ?? '') + i}
              className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-dk-border dark:bg-dk-surface"
            >
              <div className="flex items-start gap-2">
                <FileText className="mt-0.5 h-4 w-4 shrink-0 text-slate-400" />
                <div className="flex-1 min-w-0">
                  <a
                    href={p.url ?? '#'}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block truncate font-semibold text-slate-900 hover:underline dark:text-white"
                  >
                    {p.title ?? p.url}
                  </a>
                  <div className="truncate text-xs text-slate-500 dark:text-slate-400">{p.url}</div>
                  {p.excerpt && (
                    <p className="mt-2 line-clamp-3 text-sm text-slate-600 dark:text-slate-300">
                      {p.excerpt}
                    </p>
                  )}
                  <div className="mt-2 text-xs text-slate-500 dark:text-slate-400">
                    {formatNumber(p.word_count)} words
                  </div>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </section>
    </div>
  );
}

function isRoot(url: string): boolean {
  try {
    const u = new URL(url);
    return u.pathname === '/' || u.pathname === '';
  } catch {
    return false;
  }
}
