'use client';

import {
  ComposedChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import type { PostFormatDataPoint } from '@/lib/types';
import { useTheme } from '@/contexts/theme-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostFormatChartProps {
  data?: PostFormatDataPoint[];
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatValue(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
  return String(v);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PostFormatChart({ data }: PostFormatChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const gridStroke = isDark ? '#251043' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { fontSize: 12, borderRadius: 8, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' };

  const isEmpty = !data || data.length === 0;

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">
          Performance by Post Format
        </h3>
        <p className="text-xs text-slate-400 dark:text-purple-500 mt-0.5">
          Total interactions &amp; reach per content type
        </p>
      </div>

      <div className="p-5">
        {isEmpty ? (
          <div className="flex items-center justify-center h-[220px] text-sm text-slate-400 dark:text-purple-500">
            No post format data available
          </div>
        ) : (
          <ResponsiveContainer width="100%" height={220}>
            <ComposedChart data={data} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
              <defs>
                <linearGradient id="interGradFmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.7} />
                </linearGradient>
                <linearGradient id="reachGradFmt" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#6366f1" stopOpacity={0.9} />
                  <stop offset="95%" stopColor="#6366f1" stopOpacity={0.7} />
                </linearGradient>
              </defs>
              <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
              <XAxis
                dataKey="format"
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
              />
              <YAxis
                yAxisId="left"
                tickFormatter={formatValue}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={38}
              />
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatValue}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
              <Tooltip
                contentStyle={tooltipStyle}
                formatter={(value: number | undefined, name: string | undefined) => [
                  formatValue(value ?? 0),
                  name === 'interactions' ? 'Interactions' : 'Reach',
                ]}
              />
              <Legend
                iconType="circle"
                iconSize={8}
                wrapperStyle={{ fontSize: 12, paddingTop: 8, color: isDark ? '#c4b5fd' : undefined }}
              />
              <Bar
                yAxisId="left"
                dataKey="interactions"
                name="interactions"
                fill="url(#interGradFmt)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
              <Bar
                yAxisId="right"
                dataKey="reach"
                name="reach"
                fill="url(#reachGradFmt)"
                radius={[4, 4, 0, 0]}
                maxBarSize={60}
              />
            </ComposedChart>
          </ResponsiveContainer>
        )}
      </div>
    </div>
  );
}
