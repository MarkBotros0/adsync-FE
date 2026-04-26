'use client';

import { AlertTriangle, ShieldCheck } from 'lucide-react';
import type { BrandUsage } from '@/lib/types';

interface BudgetBannerProps {
  usage: BrandUsage | null;
}

export function BudgetBanner({ usage }: BudgetBannerProps) {
  if (!usage) return null;
  const { budget } = usage;
  if (!budget.will_warn && !budget.will_block) return null;

  const Icon = budget.will_block ? AlertTriangle : ShieldCheck;
  const tone = budget.will_block
    ? 'border-rose-300 bg-rose-50 text-rose-800 dark:border-rose-500/40 dark:bg-rose-500/10 dark:text-rose-200'
    : 'border-amber-300 bg-amber-50 text-amber-800 dark:border-amber-500/40 dark:bg-amber-500/10 dark:text-amber-200';

  const percent = budget.percent_used != null ? `${Math.round(budget.percent_used)}%` : '—';
  const cap =
    budget.monthly_compute_unit_budget != null
      ? `${budget.monthly_compute_unit_budget.toFixed(0)} CU`
      : 'unlimited';

  return (
    <div
      className={`flex flex-col gap-2 rounded-xl border px-4 py-3 sm:flex-row sm:items-center sm:justify-between ${tone}`}
      role="alert"
    >
      <div className="flex items-start gap-3">
        <Icon className="mt-0.5 h-5 w-5 shrink-0" />
        <div>
          <p className="text-sm font-semibold">
            {budget.will_block
              ? 'Compute-unit budget exceeded'
              : 'Approaching your monthly compute-unit budget'}
          </p>
          <p className="text-xs opacity-90">
            {budget.used_compute_units.toFixed(2)} CU used of {cap} ({percent}). New scrapes are{' '}
            {budget.will_block ? 'blocked' : 'still allowed for now'}.
          </p>
        </div>
      </div>
      {budget.percent_used != null && (
        <div className="h-1.5 w-full overflow-hidden rounded-full bg-white/40 sm:w-40 dark:bg-white/10">
          <div
            className={`h-full ${budget.will_block ? 'bg-rose-500' : 'bg-amber-500'}`}
            style={{ width: `${Math.min(100, budget.percent_used)}%` }}
          />
        </div>
      )}
    </div>
  );
}
