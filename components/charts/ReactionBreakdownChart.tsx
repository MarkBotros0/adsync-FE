'use client';

import { Cell, Pie, PieChart, ResponsiveContainer, Tooltip } from 'recharts';
import { useTheme } from '@/contexts/theme-context';

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
  const { theme } = useTheme();
  const tooltipStyle = theme === 'dark'
    ? { fontSize: 11, borderRadius: 6, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 11, borderRadius: 6 };

  const rows = ORDER
    .map((k) => ({ name: k, value: breakdown[k] ?? 0 }))
    .filter((r) => r.value > 0);
  const total = rows.reduce((s, r) => s + r.value, 0);

  if (total === 0) {
    return (
      <div className="flex h-[220px] items-center justify-center text-sm text-slate-500 dark:text-purple-400">
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
          contentStyle={tooltipStyle}
          formatter={(value, name) => {
            const v = typeof value === 'number' ? value : 0;
            return [`${v} (${((v / total) * 100).toFixed(1)}%)`, String(name)];
          }}
        />
      </PieChart>
    </ResponsiveContainer>
  );
}
