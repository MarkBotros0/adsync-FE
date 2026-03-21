'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { INTERACTIONS_DATA } from '@/lib/mock-data';
import type { InteractionDataPoint } from '@/lib/types';
import { useTheme } from '@/contexts/theme-context';

export function InteractionsChart({ data }: { data?: InteractionDataPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = data ?? INTERACTIONS_DATA;

  const gridStroke = isDark ? '#251043' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { fontSize: 12, borderRadius: 8, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' };

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Social Media Interactions</h3>
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="interGrad" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.4} />
                <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.02} />
              </linearGradient>
            </defs>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={25}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(v: number | undefined) => [v ?? 0, 'Interactions']}
            />
            <Area
              type="monotone"
              dataKey="interactions"
              stroke="#7c3aed"
              fill="url(#interGrad)"
              strokeWidth={2.5}
            />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
