'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';

interface ReactionBreakdownChartProps {
  /** Map of reaction key → count. Keys: like / love / haha / wow / sad / angry. */
  breakdown: Record<string, number>;
}

const ORDER = ['like', 'love', 'haha', 'wow', 'sad', 'angry'] as const;
const COLORS: Record<string, string> = {
  like: '#3b82f6',
  love: '#ef4444',
  haha: '#f59e0b',
  wow: '#a855f7',
  sad: '#64748b',
  angry: '#dc2626',
};

/** Donut of Facebook's per-reaction-type breakdown. */
export function ReactionBreakdownChart({ breakdown }: ReactionBreakdownChartProps) {
  const rows = ORDER
    .map((k) => ({ name: k, value: breakdown[k] ?? 0 }))
    .filter((r) => r.value > 0);
  const total = rows.reduce((s, r) => s + r.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500">
        No reactions yet
      </div>
    );
  }

  return (
    <ResponsiveContainer width="100%" height={220}>
      <PieChart>
        <Pie data={rows} dataKey="value" innerRadius={50} outerRadius={85} paddingAngle={2}>
          {rows.map((r, i) => (
            <Cell key={i} fill={COLORS[r.name] ?? '#94a3b8'} />
          ))}
        </Pie>
        <Tooltip
          formatter={(value: number, name: string) => [
            `${value} (${((value / total) * 100).toFixed(1)}%)`,
            name,
          ]}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
