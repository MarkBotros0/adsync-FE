'use client';

import { MessageSquare, Radio, Zap, TrendingDown, TrendingUp } from 'lucide-react';
import type { MentionStats } from '@/lib/types';

function formatReach(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return n.toString();
}

interface StatsBarProps {
  stats: MentionStats;
}

const items = (s: MentionStats) => [
  {
    icon: MessageSquare,
    label: 'mentions',
    value: s.total_mentions.toLocaleString(),
    color: 'text-slate-700',
  },
  {
    icon: Radio,
    label: 'reach',
    value: formatReach(s.total_reach),
    color: 'text-slate-700',
  },
  {
    icon: Zap,
    label: 'interactions',
    value: s.total_interactions.toLocaleString(),
    color: 'text-slate-700',
  },
  {
    icon: TrendingDown,
    label: 'negative mentions',
    value: s.negative_count === 0 ? '-' : s.negative_count.toString(),
    color: s.negative_count > 0 ? 'text-red-600' : 'text-slate-400',
  },
  {
    icon: TrendingUp,
    label: 'positive mentions',
    value: s.positive_count.toString(),
    extra: s.positive_percentage === 100 ? '100%' : `${s.positive_percentage}%`,
    color: 'text-green-600',
  },
];

export function StatsBar({ stats }: StatsBarProps) {
  return (
    <div className="bg-white border-b border-slate-200 px-6 py-4">
      <div className="flex items-start gap-8 overflow-x-auto pb-1">
        {items(stats).map(item => (
          <div key={item.label} className="flex items-start gap-3 shrink-0">
            <div className="mt-0.5 p-2 bg-slate-100 rounded-lg">
              <item.icon className="h-4 w-4 text-slate-500" />
            </div>
            <div>
              <p className="text-[11px] text-slate-500 leading-none mb-1">{item.label}</p>
              <div className="flex items-baseline gap-1">
                <span className={`text-2xl font-semibold leading-none ${item.color}`}>
                  {item.value}
                </span>
                {(item as any).extra && (
                  <span className="text-xs font-medium text-green-600">
                    {(item as any).extra}
                  </span>
                )}
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
