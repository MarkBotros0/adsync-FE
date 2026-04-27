'use client';

import { useEffect, useState } from 'react';
import { Loader2, MessageCircle, X } from 'lucide-react';
import { formatDistanceToNow } from 'date-fns';
import { instagramV2API } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import type { InstagramCommentAnalysis } from '@/lib/types';

interface CommentsDrawerProps {
  mediaId: string;
  open: boolean;
  onClose: () => void;
}

const SENTIMENT_CLS: Record<'positive' | 'neutral' | 'negative', string> = {
  positive: 'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  neutral:  'bg-slate-100 text-slate-600 dark:bg-slate-500/15 dark:text-slate-300',
  negative: 'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

/**
 * Side-drawer panel that loads the comment thread for an IG media item, runs
 * each comment through the in-process sentiment classifier (server-side), and
 * renders the thread with sentiment chips + a roll-up summary.
 *
 * Read-only this round — reply / hide / delete are deferred until we wire the
 * IG ``manage_comments`` scope through the backend.
 */
export function CommentsDrawer({ mediaId, open, onClose }: CommentsDrawerProps) {
  const { token } = useBrandAuthContext();
  const [data, setData] = useState<InstagramCommentAnalysis | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!open || !token) return;
    let cancelled = false;
    setLoading(true);
    setError(null);
    instagramV2API
      .commentsAnalysis(token, mediaId)
      .then((res) => {
        if (cancelled) return;
        const payload = (res.data as { data?: InstagramCommentAnalysis }).data;
        setData(payload ?? null);
      })
      .catch(() => {
        if (!cancelled) setError('Could not load comments — check that this brand has Instagram connected.');
      })
      .finally(() => { if (!cancelled) setLoading(false); });
    return () => { cancelled = true; };
  }, [open, token, mediaId]);

  if (!open) return null;

  const summary = data?.summary;

  return (
    <div className="fixed inset-0 z-50 flex" role="dialog" aria-modal="true">
      {/* Backdrop */}
      <button
        type="button"
        aria-label="Close comments"
        className="flex-1 bg-slate-900/40 dark:bg-black/60"
        onClick={onClose}
      />

      {/* Drawer */}
      <aside className="flex w-full max-w-md flex-col border-l border-slate-200 bg-white shadow-2xl dark:border-dk-border dark:bg-dk-surface sm:max-w-lg">
        <header className="flex items-center justify-between border-b border-slate-100 px-5 py-4 dark:border-dk-border">
          <div>
            <h2 className="text-sm font-semibold text-slate-900 dark:text-purple-100">
              <MessageCircle className="mr-1.5 inline h-4 w-4" />
              Comments
            </h2>
            <p className="text-xs text-slate-500">Sentiment analysed on the server.</p>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="rounded-md p-1 text-slate-500 hover:bg-slate-100 dark:hover:bg-dk-raised"
          >
            <X className="h-4 w-4" />
          </button>
        </header>

        {/* Summary */}
        {summary && summary.total > 0 && (
          <div className="border-b border-slate-100 px-5 py-3 text-xs dark:border-dk-border">
            <div className="flex items-center gap-3 text-slate-500">
              <span>{summary.total} total</span>
              <span className="rounded-full bg-emerald-100 px-2 py-0.5 font-mono text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300">
                {summary.positive_pct.toFixed(0)}% positive
              </span>
              <span className="rounded-full bg-rose-100 px-2 py-0.5 font-mono text-rose-700 dark:bg-rose-500/15 dark:text-rose-300">
                {summary.negative_pct.toFixed(0)}% negative
              </span>
            </div>
          </div>
        )}

        <div className="flex-1 overflow-y-auto px-5 py-4">
          {loading && (
            <div className="flex items-center justify-center gap-2 text-sm text-slate-500">
              <Loader2 className="h-4 w-4 animate-spin" />
              Loading comments…
            </div>
          )}

          {error && (
            <p className="text-center text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}

          {!loading && !error && data && data.comments.length === 0 && (
            <p className="text-center text-sm text-slate-500">No comments on this post yet.</p>
          )}

          {!loading && !error && data && data.comments.length > 0 && (
            <ul className="space-y-4">
              {data.comments.map((c) => (
                <li key={c.id} className="rounded-lg border border-slate-100 p-3 dark:border-dk-border">
                  <div className="mb-1 flex items-center gap-2 text-xs">
                    <span className="font-semibold text-slate-700 dark:text-purple-200">
                      @{c.username || 'user'}
                    </span>
                    <span className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] uppercase ${SENTIMENT_CLS[c.sentiment]}`}>
                      {c.sentiment}
                    </span>
                    {c.like_count > 0 && (
                      <span className="text-slate-400">♥ {c.like_count}</span>
                    )}
                    <span className="ml-auto text-slate-400">
                      {c.timestamp ? formatDistanceToNow(new Date(c.timestamp), { addSuffix: true }) : ''}
                    </span>
                  </div>
                  <p className="text-sm text-slate-700 dark:text-purple-100">{c.text}</p>

                  {c.replies && c.replies.length > 0 && (
                    <ul className="mt-3 space-y-2 border-l-2 border-slate-100 pl-3 dark:border-dk-border">
                      {c.replies.map((r) => (
                        <li key={r.id} className="text-xs">
                          <div className="mb-0.5 flex items-center gap-2">
                            <span className={`rounded-full px-1.5 py-0.5 font-mono text-[10px] uppercase ${SENTIMENT_CLS[r.sentiment]}`}>
                              {r.sentiment}
                            </span>
                          </div>
                          <p className="text-slate-600 dark:text-purple-200">{r.text}</p>
                        </li>
                      ))}
                    </ul>
                  )}
                </li>
              ))}
            </ul>
          )}
        </div>
      </aside>
    </div>
  );
}
