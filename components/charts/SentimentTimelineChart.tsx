'use client';

import {
  AreaChart,
  Area,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { SENTIMENT_DATA } from '@/lib/mock-data';
import type { SentimentDataPoint } from '@/lib/types';
import { Download, Sparkles, Info } from 'lucide-react';
import { useTheme } from '@/contexts/theme-context';

export function SentimentTimelineChart({ data }: { data?: SentimentDataPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = data ?? SENTIMENT_DATA;

  const gridStroke = isDark ? '#251043' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { fontSize: 12, borderRadius: 8, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' };

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <div className="flex items-center gap-2">
          <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Sentiment Over Time</h3>
          <Info className="h-3.5 w-3.5 text-slate-400 dark:text-purple-500" />
          <span className="text-xs text-slate-400 dark:text-purple-500">
            AI classifies sentiment — refresh to update
          </span>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-lg transition-colors">
            <Sparkles className="h-3 w-3" />
            Run AI Analysis
          </button>
          <button className="text-slate-400 dark:text-purple-500 hover:text-slate-600 dark:hover:text-purple-300">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5">
        <ResponsiveContainer width="100%" height={200}>
          <AreaChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <defs>
              <linearGradient id="pos" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#22c55e" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#22c55e" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="neg" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#ef4444" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#ef4444" stopOpacity={0} />
              </linearGradient>
              <linearGradient id="neu" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#94a3b8" stopOpacity={0.3} />
                <stop offset="95%" stopColor="#94a3b8" stopOpacity={0} />
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
            <Tooltip contentStyle={tooltipStyle} />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8, color: isDark ? '#c4b5fd' : undefined }}
            />
            <Area type="monotone" dataKey="positive" stroke="#22c55e" fill="url(#pos)" strokeWidth={2} name="Positive" />
            <Area type="monotone" dataKey="negative" stroke="#ef4444" fill="url(#neg)" strokeWidth={2} name="Negative" />
            <Area type="monotone" dataKey="neutral"  stroke="#94a3b8" fill="url(#neu)" strokeWidth={2} name="Neutral"  />
          </AreaChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
