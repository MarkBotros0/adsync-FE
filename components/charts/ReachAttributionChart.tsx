'use client';

import {
  Area,
  AreaChart,
  CartesianGrid,
  Legend,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface ReachAttributionChartProps {
  /** Daily series — accepts the FB reach-breakdown payload shape. */
  series: Record<string, { date: string; value: number }[]>;
}

const PALETTE: Record<string, string> = {
  page_impressions_organic_unique: '#22c55e',
  page_impressions_paid_unique: '#a855f7',
  page_impressions_viral_unique: '#06b6d4',
};

const PRETTY: Record<string, string> = {
  page_impressions_organic_unique: 'Organic',
  page_impressions_paid_unique: 'Paid',
  page_impressions_viral_unique: 'Viral',
};

/** Stacked area: paid / organic / viral reach across the window (Facebook). */
export function ReachAttributionChart({ series }: ReachAttributionChartProps) {
  // Pivot the FB shape (one series per metric) into one row per date.
  const dates = Array.from(
    new Set(
      Object.values(series).flatMap((s) => s.map((p) => p.date)),
    ),
  ).sort();

  const rows = dates.map((date) => {
    const row: Record<string, string | number> = { date };
    Object.entries(series).forEach(([metric, points]) => {
      const found = points.find((p) => p.date === date);
      row[PRETTY[metric] ?? metric] = found?.value ?? 0;
    });
    return row;
  });

  return (
    <ResponsiveContainer width="100%" height={260}>
      <AreaChart data={rows}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="date" tick={{ fontSize: 11 }} />
        <YAxis tick={{ fontSize: 11 }} />
        <Tooltip />
        <Legend wrapperStyle={{ fontSize: 12 }} />
        {Object.entries(series).map(([metric]) => (
          <Area
            key={metric}
            type="monotone"
            dataKey={PRETTY[metric] ?? metric}
            stackId="reach"
            stroke={PALETTE[metric] ?? '#64748b'}
            fill={PALETTE[metric] ?? '#64748b'}
            fillOpacity={0.35}
          />
        ))}
      </AreaChart>
    </ResponsiveContainer>
  );
}
