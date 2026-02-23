'use client';

import { motion } from 'framer-motion';
import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { EngagementChartData } from '@/lib/types';

interface ModernChartProps {
  data: EngagementChartData[];
  title?: string;
  description?: string;
}

const CustomTooltip = ({ active, payload, label }: any) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 backdrop-blur-xl p-4 rounded-2xl border border-slate-200/60 shadow-xl">
        <p className="font-semibold text-slate-900 mb-2">{label}</p>
        {payload.map((entry: any, index: number) => (
          <div key={index} className="flex items-center gap-2 text-sm">
            <div className="w-3 h-3 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-600">{entry.name}:</span>
            <span className="font-semibold text-slate-900">{entry.value.toLocaleString()}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export function ModernChart({ data, title = 'Engagement Trends', description = 'Track your performance over time' }: ModernChartProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: 0.2 }}
      className="bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-lg"
    >
      <div className="mb-6">
        <h3 className="text-xl font-bold text-slate-900">{title}</h3>
        <p className="text-sm text-slate-600 mt-1">{description}</p>
      </div>

      <ResponsiveContainer width="100%" height={350}>
        <AreaChart data={data}>
          <defs>
            <linearGradient id="colorImpressions" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorEngagement" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#10b981" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
            </linearGradient>
            <linearGradient id="colorReach" x1="0" y1="0" x2="0" y2="1">
              <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.3}/>
              <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
            </linearGradient>
          </defs>
          <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" strokeOpacity={0.5} />
          <XAxis 
            dataKey="date" 
            stroke="#64748b"
            style={{ fontSize: '12px', fontWeight: 500 }}
            tickLine={false}
          />
          <YAxis 
            stroke="#64748b"
            style={{ fontSize: '12px', fontWeight: 500 }}
            tickLine={false}
            axisLine={false}
          />
          <Tooltip content={<CustomTooltip />} />
          <Legend 
            wrapperStyle={{ paddingTop: '20px' }}
            iconType="circle"
          />
          <Area 
            type="monotone" 
            dataKey="impressions" 
            stroke="#3b82f6" 
            strokeWidth={3}
            fill="url(#colorImpressions)"
            name="Impressions"
          />
          <Area 
            type="monotone" 
            dataKey="engagement" 
            stroke="#10b981" 
            strokeWidth={3}
            fill="url(#colorEngagement)"
            name="Engagement"
          />
          <Area 
            type="monotone" 
            dataKey="reach" 
            stroke="#f59e0b" 
            strokeWidth={3}
            fill="url(#colorReach)"
            name="Reach"
          />
        </AreaChart>
      </ResponsiveContainer>
    </motion.div>
  );
}
