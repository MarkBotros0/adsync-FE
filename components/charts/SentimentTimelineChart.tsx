'use client';

import { useState, useMemo } from 'react';
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
import { useTheme } from '@/contexts/theme-context';

type Granularity = 'day' | 'week' | 'month';

const GRANULARITY_OPTIONS: { value: Granularity; label: string }[] = [
  { value: 'day',   label: 'Day'   },
  { value: 'week',  label: 'Week'  },
  { value: 'month', label: 'Month' },
];

const MONTH_MAP: Record<string, number> = {
  Jan: 0, Feb: 1, Mar: 2, Apr: 3, May: 4, Jun: 5,
  Jul: 6, Aug: 7, Sep: 8, Oct: 9, Nov: 10, Dec: 11,
};

function parseDate(dateStr: string): Date {
  const parts = dateStr.split(' ');
  // Handle both "Feb 22" and "16 Dec" formats
  const monthFirst = isNaN(parseInt(parts[0], 10));
  const monthStr = monthFirst ? parts[0] : parts[1];
  const day = parseInt(monthFirst ? parts[1] : parts[0], 10);
  return new Date(new Date().getFullYear(), MONTH_MAP[monthStr] ?? 0, isNaN(day) ? 1 : day);
}

function groupData(data: SentimentDataPoint[], granularity: Granularity): SentimentDataPoint[] {
  if (granularity === 'day') return data;

  const buckets = new Map<string, SentimentDataPoint>();

  for (const point of data) {
    const d = parseDate(point.date);
    let key: string;

    if (granularity === 'week') {
      const dayOfWeek = d.getDay();
      const weekStart = new Date(d);
      weekStart.setDate(d.getDate() - dayOfWeek);
      key = `${Object.keys(MONTH_MAP)[weekStart.getMonth()]} ${weekStart.getDate()}`;
    } else {
      key = Object.keys(MONTH_MAP)[d.getMonth()];
    }

    const existing = buckets.get(key);
    if (existing) {
      existing.positive += point.positive;
      existing.negative += point.negative;
      existing.neutral  += point.neutral;
    } else {
      buckets.set(key, { date: key, positive: point.positive, negative: point.negative, neutral: point.neutral });
    }
  }

  return Array.from(buckets.values());
}

export function SentimentTimelineChart({ data }: { data?: SentimentDataPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const rawData = data ?? SENTIMENT_DATA;

  const [granularity, setGranularity] = useState<Granularity>('day');

  const chartData = useMemo(() => groupData(rawData, granularity), [rawData, granularity]);

  const gridStroke = isDark ? '#251043' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { fontSize: 12, borderRadius: 8, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' };

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Sentiment Over Time</h3>
        <select
          value={granularity}
          onChange={(e) => setGranularity(e.target.value as Granularity)}
          className="text-xs rounded-md border border-slate-200 dark:border-dk-border bg-white dark:bg-dk-surface text-slate-700 dark:text-purple-200 px-2 py-1 focus:outline-none focus:ring-1 focus:ring-purple-400"
        >
          {GRANULARITY_OPTIONS.map((opt) => (
            <option key={opt.value} value={opt.value}>{opt.label}</option>
          ))}
        </select>
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
