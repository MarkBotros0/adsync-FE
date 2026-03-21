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
import { Download, Sparkles } from 'lucide-react';

function formatReach(v: number) {
  if (v >= 1_000_000) return (v / 1_000_000).toFixed(1) + 'M';
  if (v >= 1_000) return (v / 1_000).toFixed(0) + 'K';
  return String(v);
}

export function VolumeReachChart({ data }: { data?: VolumeDataPoint[] }) {
  const chartData = data ?? VOLUME_DATA;
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <h3 className="text-sm font-semibold text-slate-800">Volume of Mentions &amp; Reach</h3>
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
        <ResponsiveContainer width="100%" height={220}>
          <ComposedChart data={chartData} margin={{ top: 5, right: 10, left: 0, bottom: 5 }}>
            <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
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
              contentStyle={{ fontSize: 12, borderRadius: 8, border: '1px solid #e2e8f0' }}
              formatter={(value: number | undefined, name: string | undefined) => [
                name === 'reach' ? formatReach(value ?? 0) : (value ?? 0),
                name === 'reach' ? 'Reach' : 'Mentions',
              ]}
            />
            <Legend
              iconType="circle"
              iconSize={8}
              wrapperStyle={{ fontSize: 12, paddingTop: 8 }}
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
