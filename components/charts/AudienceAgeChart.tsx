'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';

interface AudienceAgeChartProps {
  /** Map of bucket → count, e.g. `{ "25-34": 1200, "35-44": 800, ... }`. */
  data: Record<string, number>;
}

/** Bar chart of the marketing-expert spec's age chart (#5 in the deck). */
export function AudienceAgeChart({ data }: AudienceAgeChartProps) {
  const rows = Object.entries(data).map(([bucket, count]) => ({ bucket, count }));

  if (rows.length === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
        No audience-age data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="bucket" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
        <Bar dataKey="count" fill="#7c3aed" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
