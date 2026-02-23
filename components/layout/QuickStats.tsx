'use client';

import { motion } from 'framer-motion';
import { ArrowTrendingUpIcon, ArrowTrendingDownIcon } from '@heroicons/react/24/solid';

interface QuickStat {
  label: string;
  value: string;
  change: number;
  changeLabel: string;
}

interface QuickStatsProps {
  stats: QuickStat[];
}

export function QuickStats({ stats }: QuickStatsProps) {
  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
      {stats.map((stat, index) => (
        <motion.div
          key={stat.label}
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.3, delay: index * 0.05 }}
          className="bg-white rounded-2xl p-5 border border-slate-200 hover:shadow-lg transition-shadow"
        >
          <div className="flex items-start justify-between mb-3">
            <span className="text-sm font-medium text-slate-600">{stat.label}</span>
            <span className={`inline-flex items-center gap-1 text-xs font-semibold px-2 py-1 rounded-full ${
              stat.change >= 0 
                ? 'bg-emerald-100 text-emerald-700' 
                : 'bg-rose-100 text-rose-700'
            }`}>
              {stat.change >= 0 ? (
                <ArrowTrendingUpIcon className="w-3 h-3" />
              ) : (
                <ArrowTrendingDownIcon className="w-3 h-3" />
              )}
              {Math.abs(stat.change)}%
            </span>
          </div>
          <div className="text-3xl font-bold text-slate-900 mb-1">{stat.value}</div>
          <div className="text-xs text-slate-500">{stat.changeLabel}</div>
        </motion.div>
      ))}
    </div>
  );
}
