'use client';

import { useCallback, useEffect, useState } from 'react';
import { CheckCircle2, Clock3, XCircle } from 'lucide-react';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { publishAPI } from '@/lib/api';
import type { PublishDraft } from '@/lib/types';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

export default function ApprovalsPage() {
  const { token } = useBrandAuthContext();
  const [pending, setPending] = useState<PublishDraft[]>([]);

  const refresh = useCallback(() => {
    if (!token) return;
    publishAPI.listDrafts(token, 'pending_approval')
      .then(r => setPending(r.data as PublishDraft[]))
      .catch(() => setPending([]));
  }, [token]);

  useEffect(() => { refresh(); }, [refresh]);

  const handleApprove = async (id: number) => {
    if (!token) return;
    await publishAPI.approve(token, id);
    refresh();
  };

  const handleReject = async (id: number) => {
    if (!token) return;
    const reason = prompt('Reason for rejection (visible to the author):');
    if (!reason) return;
    await publishAPI.reject(token, id, reason);
    refresh();
  };

  if (!token) return null;

  if (pending.length === 0) {
    return (
      <EchofoldEmptyState
        icon={Clock3}
        title="Nothing waiting on you"
        description="When a team member submits a draft for approval, it'll show up here."
      />
    );
  }

  return (
    <div className="flex h-full flex-col">
      <header className="border-b border-slate-200 bg-white px-6 py-4 dark:border-dk-border dark:bg-dk-surface">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Pending approvals</h1>
        <p className="text-sm text-slate-500">{pending.length} draft{pending.length === 1 ? '' : 's'} awaiting review.</p>
      </header>

      <div className="flex-1 overflow-y-auto bg-slate-50 p-6 dark:bg-dk-bg">
        <ul className="space-y-3">
          {pending.map(d => (
            <li
              key={d.id}
              className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm dark:border-dk-border dark:bg-dk-surface"
            >
              <div className="mb-2 flex items-start justify-between">
                <div>
                  <p className="text-xs uppercase tracking-[0.16em] text-slate-500">Draft #{d.id}</p>
                  <p className="text-sm text-slate-700 dark:text-slate-200">{d.text || '(no caption)'}</p>
                </div>
                <div className="flex gap-2">
                  <button
                    onClick={() => handleApprove(d.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-emerald-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-emerald-700"
                  >
                    <CheckCircle2 className="h-4 w-4" />
                    Approve
                  </button>
                  <button
                    onClick={() => handleReject(d.id)}
                    className="inline-flex items-center gap-1 rounded-md bg-rose-600 px-3 py-1.5 text-xs font-semibold text-white hover:bg-rose-700"
                  >
                    <XCircle className="h-4 w-4" />
                    Reject
                  </button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 text-xs text-slate-500">
                <span>{d.platforms_json.join(', ')}</span>
                {d.scheduled_at && <span>• Scheduled {new Date(d.scheduled_at).toLocaleString()}</span>}
                {d.media_asset_ids_json.length > 0 && <span>• {d.media_asset_ids_json.length} media</span>}
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}
