'use client';

import { PeriodOverPeriodCard } from './PeriodOverPeriodCard';

interface AdsTotals {
  spend?: number;
  impressions?: number;
  reach?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  roas?: number | null;
  cost_per_purchase?: number | null;
  purchases?: number;
}

interface AdsKpiTilesProps {
  totals: AdsTotals | null | undefined;
  /** Optional period-over-period delta payload from the /summary endpoint with compare=true. */
  comparison?: { current_total?: number; previous_total?: number; delta_pct?: number | null } | null;
  currency?: string;
}

/** Six headline tiles for the ads dashboard — Spend / CPM / CPC / CTR / ROAS / Conv. */
export function AdsKpiTiles({ totals, comparison, currency = 'USD' }: AdsKpiTilesProps) {
  const t = totals ?? {};
  const spendDelta = comparison?.delta_pct ?? null;

  const fmt = (n: number | null | undefined, opts: Intl.NumberFormatOptions = {}) => {
    if (n == null) return '—';
    return new Intl.NumberFormat('en-US', { maximumFractionDigits: 2, ...opts }).format(n);
  };

  return (
    <div className="grid grid-cols-2 gap-3 sm:grid-cols-3 lg:grid-cols-6">
      <PeriodOverPeriodCard
        label="Spend"
        value={fmt(t.spend, { style: 'currency', currency })}
        deltaPct={spendDelta}
      />
      <PeriodOverPeriodCard label="CPM" value={fmt(t.cpm)} unit={currency} hideDelta />
      <PeriodOverPeriodCard label="CPC" value={fmt(t.cpc)} unit={currency} hideDelta />
      <PeriodOverPeriodCard label="CTR" value={fmt(t.ctr)} unit="%" hideDelta />
      <PeriodOverPeriodCard
        label="ROAS"
        value={t.roas == null ? '—' : `${fmt(t.roas)}×`}
        hideDelta
      />
      <PeriodOverPeriodCard
        label="Conversions"
        value={fmt(t.purchases, { maximumFractionDigits: 0 })}
        hideDelta
      />
    </div>
  );
}
