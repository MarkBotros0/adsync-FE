'use client';

import { useEffect, useMemo, useState } from 'react';
import { Calendar, Loader2 } from 'lucide-react';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { publishAPI } from '@/lib/api';
import type { PublishDraft } from '@/lib/types';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

const STATUS_COLORS: Record<string, string> = {
  draft: 'bg-slate-200 text-slate-700',
  pending_approval: 'bg-amber-100 text-amber-700',
  scheduled: 'bg-cyan-100 text-cyan-700',
  publishing: 'bg-purple-200 text-purple-800',
  published: 'bg-emerald-100 text-emerald-700',
  failed: 'bg-rose-100 text-rose-700',
};

function startOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth(), 1);
}
function endOfMonth(d: Date) {
  return new Date(d.getFullYear(), d.getMonth() + 1, 0, 23, 59, 59);
}

export default function CalendarPage() {
  const { token } = useBrandAuthContext();
  const [cursor, setCursor] = useState(new Date());
  const [posts, setPosts] = useState<PublishDraft[]>([]);
  const [loading, setLoading] = useState(false);

  const range = useMemo(() => ({
    from: startOfMonth(cursor).toISOString(),
    to: endOfMonth(cursor).toISOString(),
  }), [cursor]);

  useEffect(() => {
    if (!token) return;
    setLoading(true);
    publishAPI.calendar(token, range.from, range.to)
      .then(r => setPosts(r.data as PublishDraft[]))
      .catch(() => setPosts([]))
      .finally(() => setLoading(false));
  }, [token, range.from, range.to]);

  if (!token) {
    return <EchofoldEmptyState icon={Calendar} title="Sign in to view your calendar" description="" />;
  }

  // Build a 6-week grid that covers the cursor month.
  const first = startOfMonth(cursor);
  const startWeekday = (first.getDay() + 6) % 7; // Monday = 0
  const days: Date[] = [];
  for (let i = 0; i < 42; i++) {
    days.push(new Date(first.getFullYear(), first.getMonth(), 1 - startWeekday + i));
  }

  const postsByDay = new Map<string, PublishDraft[]>();
  posts.forEach(p => {
    if (!p.scheduled_at) return;
    const k = p.scheduled_at.slice(0, 10);
    const arr = postsByDay.get(k) ?? [];
    arr.push(p);
    postsByDay.set(k, arr);
  });

  const monthLabel = cursor.toLocaleString('en-US', { month: 'long', year: 'numeric' });

  return (
    <div className="flex h-full flex-col">
      <header className="flex items-center justify-between border-b border-slate-200 bg-white px-6 py-4 dark:border-dk-border dark:bg-dk-surface">
        <div>
          <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">{monthLabel}</h1>
          <p className="text-sm text-slate-500">Drag-to-reschedule coming soon — click a post to edit.</p>
        </div>
        <div className="flex items-center gap-2">
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() - 1, 1))}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-dk-border"
          >
            ←
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date())}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-dk-border"
          >
            Today
          </button>
          <button
            type="button"
            onClick={() => setCursor(new Date(cursor.getFullYear(), cursor.getMonth() + 1, 1))}
            className="rounded-md border border-slate-200 px-3 py-1.5 text-sm hover:bg-slate-50 dark:border-dk-border"
          >
            →
          </button>
        </div>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-dk-bg">
        {loading && (
          <div className="flex items-center gap-2 text-sm text-slate-500">
            <Loader2 className="h-4 w-4 animate-spin" /> Loading…
          </div>
        )}

        <div className="grid grid-cols-7 gap-1 text-xs font-semibold uppercase tracking-wider text-slate-500">
          {['Mon','Tue','Wed','Thu','Fri','Sat','Sun'].map(d => (
            <div key={d} className="px-2 py-1">{d}</div>
          ))}
        </div>
        <div className="mt-1 grid grid-cols-7 gap-1">
          {days.map((d) => {
            const inMonth = d.getMonth() === cursor.getMonth();
            const k = d.toISOString().slice(0, 10);
            const dayPosts = postsByDay.get(k) ?? [];
            return (
              <div
                key={k}
                className={`min-h-[110px] rounded-md border p-2 ${
                  inMonth ? 'bg-white dark:bg-dk-surface' : 'bg-slate-100/50 dark:bg-dk-bg/40 opacity-60'
                } border-slate-200 dark:border-dk-border`}
              >
                <div className="mb-1 text-xs text-slate-500">{d.getDate()}</div>
                <div className="space-y-1">
                  {dayPosts.map(p => (
                    <div
                      key={p.id}
                      className={`truncate rounded px-1.5 py-0.5 text-[11px] ${STATUS_COLORS[p.status] ?? 'bg-slate-200 text-slate-700'}`}
                      title={`${p.text || '(no text)'} — ${p.platforms_json.join(', ')}`}
                    >
                      {p.text?.slice(0, 28) || '(no text)'}
                    </div>
                  ))}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
