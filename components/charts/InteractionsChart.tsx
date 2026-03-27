'use client';

import { useState, useMemo } from 'react';
import {
  ComposedChart,
  Area,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer,
} from 'recharts';
import { Heart, MessageCircle, Bookmark, Share2 } from 'lucide-react';
import { INTERACTIONS_DATA } from '@/lib/mock-data';
import type { InteractionDataPoint, InteractionFilter } from '@/lib/types';
import { useTheme } from '@/contexts/theme-context';

// ─── Types ────────────────────────────────────────────────────────────────────

interface InteractionTypeCard {
  key: InteractionFilter;
  label: string;
  icon: React.ElementType;
  color: string;
  darkColor: string;
  bgColor: string;
  darkBgColor: string;
}

// ─── Constants ────────────────────────────────────────────────────────────────

const INTERACTION_TYPES: InteractionTypeCard[] = [
  {
    key: 'likes',
    label: 'Likes',
    icon: Heart,
    color: 'text-rose-600',
    darkColor: 'dark:text-rose-400',
    bgColor: 'bg-rose-50',
    darkBgColor: 'dark:bg-rose-950/30',
  },
  {
    key: 'comments',
    label: 'Comments',
    icon: MessageCircle,
    color: 'text-blue-600',
    darkColor: 'dark:text-blue-400',
    bgColor: 'bg-blue-50',
    darkBgColor: 'dark:bg-blue-950/30',
  },
  {
    key: 'saves',
    label: 'Saves',
    icon: Bookmark,
    color: 'text-amber-600',
    darkColor: 'dark:text-amber-400',
    bgColor: 'bg-amber-50',
    darkBgColor: 'dark:bg-amber-950/30',
  },
  {
    key: 'shares',
    label: 'Shares',
    icon: Share2,
    color: 'text-emerald-600',
    darkColor: 'dark:text-emerald-400',
    bgColor: 'bg-emerald-50',
    darkBgColor: 'dark:bg-emerald-950/30',
  },
];

const FILTER_TABS: { key: InteractionFilter; label: string }[] = [
  { key: 'all', label: 'All' },
  { key: 'likes', label: 'Likes' },
  { key: 'comments', label: 'Comments' },
  { key: 'saves', label: 'Saves' },
  { key: 'shares', label: 'Shares' },
];

function formatReach(v: number): string {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
  return String(v);
}

// ─── Component ────────────────────────────────────────────────────────────────

export function InteractionsChart({ data }: { data?: InteractionDataPoint[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const chartData = data ?? INTERACTIONS_DATA;
  const [activeFilter, setActiveFilter] = useState<InteractionFilter>('all');

  const gridStroke = isDark ? '#251043' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { fontSize: 12, borderRadius: 8, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' };

  // Only show reach line when at least one data point has reach data
  const hasReach = chartData.some(d => d.reach !== undefined && d.reach > 0);

  // Interaction data key to display based on active filter
  const interactionKey = activeFilter === 'all' ? 'interactions' : activeFilter;

  // Compute totals for each interaction type
  const totals = useMemo(() => ({
    interactions: chartData.reduce((s, d) => s + d.interactions, 0),
    likes: chartData.reduce((s, d) => s + (d.likes ?? 0), 0),
    comments: chartData.reduce((s, d) => s + (d.comments ?? 0), 0),
    saves: chartData.reduce((s, d) => s + (d.saves ?? 0), 0),
    shares: chartData.reduce((s, d) => s + (d.shares ?? 0), 0),
  }), [chartData]);

  const interactionLabel =
    activeFilter === 'all' ? 'Interactions' :
    INTERACTION_TYPES.find(t => t.key === activeFilter)?.label ?? 'Interactions';

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      {/* Header */}
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Social Media Interactions</h3>
      </div>

      {/* Interaction type cards */}
      <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 px-5 pt-4">
        {INTERACTION_TYPES.map(type => {
          const Icon = type.icon;
          const isActive = activeFilter === type.key;
          return (
            <button
              key={type.key}
              onClick={() => setActiveFilter(isActive ? 'all' : type.key)}
              className={`
                flex items-center gap-3 p-3 rounded-lg border transition-all text-left
                ${isActive
                  ? `${type.bgColor} ${type.darkBgColor} border-current ${type.color} ${type.darkColor}`
                  : 'bg-slate-50 dark:bg-dk-raised border-slate-200 dark:border-dk-border hover:border-slate-300 dark:hover:border-purple-700'
                }
              `}
            >
              <div className={`p-1.5 rounded-md ${isActive ? 'bg-white/60 dark:bg-black/20' : 'bg-white dark:bg-dk-surface'}`}>
                <Icon className={`h-4 w-4 ${isActive ? `${type.color} ${type.darkColor}` : 'text-slate-400 dark:text-purple-500'}`} />
              </div>
              <div>
                <p className={`text-[10px] leading-none mb-1 ${isActive ? `${type.color} ${type.darkColor} opacity-75` : 'text-slate-400 dark:text-purple-500'}`}>
                  {type.label}
                </p>
                <p className={`text-lg font-semibold leading-none ${isActive ? `${type.color} ${type.darkColor}` : 'text-slate-700 dark:text-purple-100'}`}>
                  {(totals as Record<string, number>)[type.key].toLocaleString()}
                </p>
              </div>
            </button>
          );
        })}
      </div>

      {/* Filter tabs */}
      <div className="flex items-center gap-1 px-5 pt-4">
        {FILTER_TABS.map(tab => (
          <button
            key={tab.key}
            onClick={() => setActiveFilter(tab.key)}
            className={`
              px-3 py-1 rounded-full text-xs font-medium transition-colors
              ${activeFilter === tab.key
                ? 'bg-purple-600 text-white'
                : 'text-slate-500 dark:text-purple-400 hover:bg-slate-100 dark:hover:bg-dk-raised'
              }
            `}
          >
            {tab.label}
          </button>
        ))}
      </div>

      {/* Chart */}
      <div className="p-5">
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
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
              yAxisId="left"
              tick={{ fontSize: 11, fill: '#94a3b8' }}
              axisLine={false}
              tickLine={false}
              width={30}
            />
            {hasReach && (
              <YAxis
                yAxisId="right"
                orientation="right"
                tickFormatter={formatReach}
                tick={{ fontSize: 11, fill: '#94a3b8' }}
                axisLine={false}
                tickLine={false}
                width={42}
              />
            )}
            <Tooltip
              contentStyle={tooltipStyle}
              formatter={(value: number | undefined, name: string | undefined) => [
                name === 'reach' ? formatReach(value ?? 0) : (value ?? 0).toLocaleString(),
                name === 'reach' ? 'Reach' : interactionLabel,
              ]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8, color: isDark ? '#c4b5fd' : undefined }}
            />
            <Area
              yAxisId="left"
              type="monotone"
              dataKey={interactionKey}
              name={interactionLabel.toLowerCase()}
              stroke="#7c3aed"
              fill="url(#interGrad)"
              strokeWidth={2.5}
            />
            {hasReach && (
              <Line
                yAxisId="right"
                type="monotone"
                dataKey="reach"
                name="reach"
                stroke="#6366f1"
                strokeWidth={2}
                dot={{ r: 3, fill: '#6366f1' }}
              />
            )}
          </ComposedChart>
        </ResponsiveContainer>
      </div>
    </div>
  );
}
