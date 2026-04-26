'use client';

import { useEffect, useState } from 'react';
import { Loader2, X, Wallet, AlertTriangle } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { COMPETITOR_ACTOR_LABELS } from '@/lib/constants';
import type { BrandUsage, CompetitorActorKey, EstimatedCost } from '@/lib/types';

const COST_ACK_KEY = 'competitor:cost-confirm-ack';

interface CostConfirmDialogProps {
  open: boolean;
  actorKey: CompetitorActorKey;
  estimate: EstimatedCost | null;
  estimateLoading: boolean;
  lastActualUsd: number | null;
  budget: BrandUsage | null;
  submitting: boolean;
  onConfirm: () => Promise<void> | void;
  onCancel: () => void;
}

/** Mirror of session-storage acknowledgement; static check for callers that
 *  want to skip the dialog entirely. */
export function shouldSkipCostDialog(): boolean {
  if (typeof window === 'undefined') return false;
  return window.sessionStorage.getItem(COST_ACK_KEY) === '1';
}

export function clearCostDialogAck(): void {
  if (typeof window === 'undefined') return;
  window.sessionStorage.removeItem(COST_ACK_KEY);
}

export function CostConfirmDialog({
  open,
  actorKey,
  estimate,
  estimateLoading,
  lastActualUsd,
  budget,
  submitting,
  onConfirm,
  onCancel,
}: CostConfirmDialogProps) {
  const [dontAsk, setDontAsk] = useState(false);

  useEffect(() => {
    if (!open) setDontAsk(false);
  }, [open]);

  if (!open) return null;

  const blocking = !!budget?.budget.will_block;
  const warning = !!budget?.budget.will_warn;
  const label = COMPETITOR_ACTOR_LABELS[actorKey];
  const avgUsd = estimate?.avg_usage_usd;
  const lowUsd = estimate?.low_usd;
  const highUsd = estimate?.high_usd;
  const basis = estimate?.basis ?? 'no-data';

  const handleConfirm = async () => {
    if (dontAsk && typeof window !== 'undefined') {
      window.sessionStorage.setItem(COST_ACK_KEY, '1');
    }
    await onConfirm();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="cost-confirm-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => !submitting && onCancel()}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl dark:border-dk-border dark:bg-dk-surface">
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-2 sm:px-6 sm:pt-6">
          <div>
            <h2 id="cost-confirm-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              Run the {label} scraper?
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              This call uses Apify compute units billed to your organization.
            </p>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onCancel()}
            className="-mr-2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-3 px-5 pb-3 sm:px-6">
          <div className="rounded-xl border border-slate-200 bg-slate-50 p-4 dark:border-dk-border dark:bg-dk-raised">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <Wallet className="h-3.5 w-3.5" /> Estimated cost
            </div>
            <div className="mt-1.5 flex items-baseline gap-2">
              {estimateLoading ? (
                <Loader2 className="h-5 w-5 animate-spin text-slate-400" />
              ) : avgUsd != null ? (
                <>
                  <span className="text-2xl font-semibold text-slate-900 dark:text-white">
                    {formatUsd(avgUsd)}
                  </span>
                  {lowUsd != null && highUsd != null && (
                    <span className="text-xs text-slate-500 dark:text-slate-400">
                      {formatUsd(lowUsd)} – {formatUsd(highUsd)}
                    </span>
                  )}
                </>
              ) : (
                <span className="text-sm text-slate-500 dark:text-slate-400">
                  No history yet — actual cost recorded after the run.
                </span>
              )}
            </div>
            <p className="mt-1 text-[11px] text-slate-500 dark:text-slate-400">
              {basisLabel(basis)}
              {lastActualUsd != null && (
                <> · Last run: {formatUsd(lastActualUsd)}</>
              )}
            </p>
          </div>

          {budget && (
            <BudgetBox
              used={budget.budget.used_compute_units}
              budget={budget.budget.monthly_compute_unit_budget}
              percent={budget.budget.percent_used}
              willWarn={warning}
              willBlock={blocking}
            />
          )}

          <label className="flex items-center gap-2 text-xs text-slate-500 dark:text-slate-400">
            <input
              type="checkbox"
              checked={dontAsk}
              onChange={(e) => setDontAsk(e.target.checked)}
              className="h-3.5 w-3.5 rounded border-slate-300 dark:border-dk-border"
            />
            Don&apos;t ask again this session
          </label>
        </div>

        <div className="flex flex-col-reverse gap-2 px-5 pb-5 pt-3 sm:flex-row sm:justify-end sm:px-6 sm:pb-6">
          <button
            type="button"
            onClick={onCancel}
            disabled={submitting}
            className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
          >
            Cancel
          </button>
          <Button
            size="sm"
            onClick={handleConfirm}
            disabled={submitting || blocking}
            className="w-full sm:w-auto"
          >
            {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
            {blocking ? 'Budget blocked' : submitting ? 'Starting…' : 'Run scraper'}
          </Button>
        </div>
      </div>
    </div>
  );
}

function BudgetBox({
  used,
  budget,
  percent,
  willWarn,
  willBlock,
}: {
  used: number;
  budget: number | null;
  percent: number | null;
  willWarn: boolean;
  willBlock: boolean;
}) {
  const tone = willBlock
    ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200'
    : willWarn
      ? 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200'
      : 'border-slate-200 bg-white text-slate-700 dark:border-dk-border dark:bg-dk-raised dark:text-slate-200';
  return (
    <div className={`rounded-xl border p-3 text-xs ${tone}`}>
      <div className="flex items-center justify-between">
        <span className="font-semibold">This month</span>
        {(willWarn || willBlock) && <AlertTriangle className="h-3.5 w-3.5" />}
      </div>
      <p className="mt-1 opacity-90">
        {used.toFixed(2)} CU used
        {budget != null ? ` of ${budget.toFixed(0)}` : ' (no cap configured)'}
        {percent != null && <> · {Math.round(percent)}%</>}
      </p>
      {percent != null && budget != null && (
        <div className="mt-2 h-1.5 w-full overflow-hidden rounded-full bg-slate-200/70 dark:bg-white/10">
          <div
            className={`h-full ${willBlock ? 'bg-rose-500' : willWarn ? 'bg-amber-500' : 'bg-blue-500'}`}
            style={{ width: `${Math.min(100, percent)}%` }}
          />
        </div>
      )}
    </div>
  );
}

function formatUsd(value: number): string {
  return `$${value.toFixed(value < 1 ? 4 : 2)}`;
}

function basisLabel(basis: EstimatedCost['basis']): string {
  switch (basis) {
    case 'rolling-avg':
      return 'Estimated from your last 10 runs of this scraper';
    case 'global-avg':
      return 'Estimated from a global average — no brand history yet';
    default:
      return 'No history yet';
  }
}
