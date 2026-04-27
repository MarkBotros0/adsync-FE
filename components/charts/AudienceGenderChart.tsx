'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface AudienceGenderChartProps {
  data: { female: number; male: number; unspecified: number };
}

const COLORS = ['#a855f7', '#06b6d4', '#94a3b8'];

/** Donut of the marketing-expert spec's gender chart (#4 in the deck). */
export function AudienceGenderChart({ data }: AudienceGenderChartProps) {
  const rows = [
    { name: 'Female', value: data.female ?? 0 },
    { name: 'Male', value: data.male ?? 0 },
    { name: 'Unspecified', value: data.unspecified ?? 0 },
  ].filter((r) => r.value > 0);
  const total = rows.reduce((s, r) => s + r.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
        No audience-gender data yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie
          data={rows}
          dataKey="value"
          innerRadius={50}
          outerRadius={85}
          paddingAngle={2}
        >
          {rows.map((_, i) => (
            <Cell key={i} fill={COLORS[i % COLORS.length]} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value, name) => {
            const v = typeof value === 'number' ? value : 0;
            return [`${v} (${((v / total) * 100).toFixed(1)}%)`, String(name)];
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
