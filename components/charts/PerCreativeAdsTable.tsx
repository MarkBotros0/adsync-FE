'use client';

interface AdRow {
  ad_id?: string | null;
  ad_name?: string | null;
  campaign_name?: string | null;
  spend?: number;
  impressions?: number;
  clicks?: number;
  ctr?: number;
  cpc?: number;
  cpm?: number;
  purchases?: number;
  roas?: number | null;
  platform?: string;
}

interface PerCreativeAdsTableProps {
  rows: AdRow[];
  currency?: string;
}

const COLS: { key: keyof AdRow; label: string; format?: (v: unknown) => string; align?: 'right' | 'left' }[] = [
  { key: 'ad_name', label: 'Ad', align: 'left' },
  { key: 'campaign_name', label: 'Campaign', align: 'left' },
  { key: 'platform', label: 'Platform', align: 'left' },
  { key: 'spend', label: 'Spend', align: 'right', format: (v) => (v == null ? '—' : Number(v).toFixed(2)) },
  { key: 'impressions', label: 'Impr.', align: 'right', format: (v) => (v == null ? '—' : Number(v).toLocaleString()) },
  { key: 'clicks', label: 'Clicks', align: 'right', format: (v) => (v == null ? '—' : Number(v).toLocaleString()) },
  { key: 'ctr', label: 'CTR %', align: 'right', format: (v) => (v == null ? '—' : Number(v).toFixed(2)) },
  { key: 'cpc', label: 'CPC', align: 'right', format: (v) => (v == null ? '—' : Number(v).toFixed(2)) },
  { key: 'cpm', label: 'CPM', align: 'right', format: (v) => (v == null ? '—' : Number(v).toFixed(2)) },
  { key: 'purchases', label: 'Conv.', align: 'right', format: (v) => (v == null ? '—' : Number(v).toLocaleString()) },
  { key: 'roas', label: 'ROAS', align: 'right', format: (v) => (v == null ? '—' : `${Number(v).toFixed(2)}×`) },
];

/** Sortable per-creative table for the Ads tab. Sort handled by the parent. */
export function PerCreativeAdsTable({ rows }: PerCreativeAdsTableProps) {
  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-dk-bg dark:text-purple-400">
          <tr>
            {COLS.map((c) => (
              <th
                key={String(c.key)}
                className={`px-4 py-2 ${c.align === 'right' ? 'text-right' : 'text-left'}`}
              >
                {c.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.length === 0 && (
            <tr>
              <td colSpan={COLS.length} className="px-4 py-6 text-center text-slate-500 dark:text-purple-400">
                No ad rows in this window
              </td>
            </tr>
          )}
          {rows.map((r, i) => (
            <tr
              key={r.ad_id ?? i}
              className="border-t border-slate-100 text-slate-700 dark:border-dk-border dark:text-purple-100"
            >
              {COLS.map((c) => {
                const raw = r[c.key];
                const display = c.format ? c.format(raw) : raw == null ? '—' : String(raw);
                return (
                  <td
                    key={String(c.key)}
                    className={`px-4 py-2 ${c.align === 'right' ? 'text-right font-mono tabular-nums' : ''}`}
                  >
                    {display}
                  </td>
                );
              })}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
