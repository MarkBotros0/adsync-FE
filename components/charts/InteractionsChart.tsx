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
import { Download, Sparkles } from 'lucide-react';

export function InteractionsChart({ data }: { data?: InteractionDataPoint[] }) {
  const chartData = data ?? INTERACTIONS_DATA;
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Social Media Interactions</h3>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium border border-purple-200 px-2.5 py-1 rounded-lg transition-colors">
            <Sparkles className="h-3 w-3" />
            Run AI Analysis
          </button>
          <button className="text-slate-400 hover:text-slate-600">
            <Download className="h-4 w-4" />
          </button>
        </div>
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
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
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
