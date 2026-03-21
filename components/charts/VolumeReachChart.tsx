'use client';

import {
  ComposedChart,
  Line,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { VOLUME_DATA } from '@/lib/mock-data';
import type { VolumeDataPoint } from '@/lib/types';
import { useTheme } from '@/contexts/theme-context';

function formatReach(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
  return String(v);
}

export function VolumeReachChart({ data }: { data?: VolumeDataPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = data ?? VOLUME_DATA;

  const gridStroke = isDark ? '#251043' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { fontSize: 12, borderRadius: 8, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' };

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Volume of Mentions &amp; Reach</h3>
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis
              dataKey="date"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
            />
            <YAxis
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            <YAxis
              yAxisId="right"
              orientation="right"
              tickFormatter={formatReach}
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={40}
            />
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number | undefined, name: string | undefined) => [
                name === 'reach' ? formatReach(value ?? 0) : (value ?? 0),
                name === 'reach' ? 'Reach' : 'Mentions',
              ]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8, color: isDark ? '#c4b5fd' : undefined }}
            />
            <Bar yAxisId="left" dataKey="mentions" fill="#7c3aed" radius={[3, 3, 0, 0]} opacity={0.85} name="mentions" />
            <Line
              yAxisId="right"
              type="monotone"
              dataKey="reach"
              stroke="#6366f1"
              strokeWidth={2}
              dot={{ r: 3, fill: '#6366f1' }}
              name="reach"
            />
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
