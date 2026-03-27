'use client';

import { useState, useEffect } from 'react';
import {
  ComposedChart,
  Bar,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { instagramAPI } from '@/lib/api';
import type { FollowersGrowthDataPoint } from '@/lib/types';
import { useTheme } from '@/contexts/theme-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface FollowersGrowthChartProps {
  igSessionId: string | null;
  since?: string;
  until?: string;
}

// ─── Helpers ──────────────────────────────────────────────────────────────────

function formatFollowers(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(1) + 'K';
  return String(v);
}

function formatDate(isoString: string): string {
  const d = new Date(isoString);
  return d.toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
}

function buildGrowthData(
  points: { value: number; end_time: string }[],
): FollowersGrowthDataPoint[] {
  if (points.length === 0) return [];
  const base = points[0].value;
  return points.map(p => ({
    date: formatDate(p.end_time),
    followers: p.value,
    growth_rate: base > 0
      ? parseFloat(((p.value - base) / base * 100).toFixed(2))
      : 0,
  }));
}

// ─── Component ────────────────────────────────────────────────────────────────

export function FollowersGrowthChart({ igSessionId, since, until }: FollowersGrowthChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const [chartData, setChartData] = useState<FollowersGrowthDataPoint[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(false);

  useEffect(() => {
    if (!igSessionId) {
      setChartData([]);
      return;
    }
    setLoading(true);
    setError(false);

    instagramAPI.getFollowerTimeSeries(igSessionId, { since, until })
      .then(res => {
        const timeSeries = res.data?.data ?? {};
        const points = timeSeries['follower_count'] ?? [];
        setChartData(buildGrowthData(points));
      })
      .catch(() => setError(true))
      .finally(() => setLoading(false));
  }, [igSessionId, since, until]);

  const gridStroke = isDark ? '#251043' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { fontSize: 12, borderRadius: 8, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' };

  const renderBody = () => {
    if (!igSessionId) {
      return (
        <div className="flex items-center justify-center h-[220px] text-sm text-slate-400 dark:text-purple-500">
          Connect Instagram to see follower growth
        </div>
      );
    }
    if (loading) {
      return (
        <div className="flex items-center justify-center h-[220px]">
          <div className="w-6 h-6 rounded-full border-3 border-slate-200 border-t-purple-600 animate-spin" />
        </div>
      );
    }
    if (error || chartData.length === 0) {
      return (
        <div className="flex items-center justify-center h-[220px] text-sm text-slate-400 dark:text-purple-500">
          {error ? 'Failed to load follower data' : 'No follower data available for this period'}
        </div>
      );
    }
    return (
      <ResponsiveContainer width="100%" height={220}>
        <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
          <defs>
            <linearGradient id="followerGrad" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#7c3aed" stopOpacity={0.85} />
              <stop offset="95%" stopColor="#7c3aed" stopOpacity={0.6} />
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
            yAxisId="left"
            tickFormatter={formatFollowers}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <YAxis
            yAxisId="right"
            orientation="right"
            tickFormatter={v => `${v}%`}
            tick={{ fontSize: 11, fill: '#94a3b8' }}
            axisLine={false}
            tickLine={false}
            width={42}
          />
          <Tooltip
            contentStyle={tooltipStyle}
            formatter={(value: number | undefined, name: string | undefined) => [
              name === 'followers' ? formatFollowers(value ?? 0) : `${value ?? 0}%`,
              name === 'followers' ? 'Followers' : 'Growth Rate',
            ]}
          />
          <Legend
            iconType="circle"
            iconSize={8}
            wrapperStyle={{ fontSize: 12, paddingTop: 8, color: isDark ? '#c4b5fd' : undefined }}
          />
          <Bar
            yAxisId="left"
            dataKey="followers"
            name="followers"
            fill="url(#followerGrad)"
            radius={[3, 3, 0, 0]}
            maxBarSize={40}
          />
          <Line
            yAxisId="right"
            type="monotone"
            dataKey="growth_rate"
            name="growth_rate"
            stroke="#10b981"
            strokeWidth={2}
            dot={{ r: 3, fill: '#10b981' }}
          />
        </ComposedChart>
      </ResponsiveContainer>
    );
  };

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">
          Followers Growth Rate
        </h3>
        <p className="text-xs text-slate-400 dark:text-purple-500 mt-0.5">
          Daily follower count &amp; cumulative growth % from period start
        </p>
      </div>
      <div className="p-5">
        {renderBody()}
      </div>
    </div>
  );
}
