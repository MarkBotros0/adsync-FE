'use client';

import { motion } from 'framer-motion';
import { LucideIcon } from 'lucide-react';
import { ArrowUpIcon, ArrowDownIcon } from '@heroicons/react/24/solid';

interface StatsCardProps {
  title: string;
  value: string | number;
  change?: number;
  icon: LucideIcon;
  trend?: 'up' | 'down' | 'neutral';
  index?: number;
}

export function StatsCard({ title, value, change, icon: Icon, trend = 'neutral', index = 0 }: StatsCardProps) {
  const getTrendColor = () => {
    if (trend === 'up') return 'text-emerald-600 bg-emerald-50';
    if (trend === 'down') return 'text-rose-600 bg-rose-50';
    return 'text-slate-600 bg-slate-50';
  };

  const getIconGradient = () => {
    const gradients = [
      'from-blue-500 to-cyan-500',
      'from-purple-500 to-pink-500',
      'from-orange-500 to-red-500',
      'from-green-500 to-emerald-500',
    ];
    return gradients[index % gradients.length];
  };

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay: index * 0.1 }}
      whileHover={{ y: -4, transition: { duration: 0.2 } }}
      className="group relative"
    >
      <div className="absolute inset-0 bg-gradient-to-r from-blue-600/10 to-purple-600/10 rounded-3xl blur-xl opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
      
      <div className="relative bg-white/80 backdrop-blur-xl rounded-3xl p-6 border border-slate-200/60 shadow-lg shadow-slate-900/5 hover:shadow-xl hover:shadow-slate-900/10 transition-all duration-300">
        <div className="flex items-start justify-between mb-4">
          <div className="flex-1">
            <p className="text-sm font-medium text-slate-600 mb-1">{title}</p>
            <motion.p 
              className="text-3xl font-bold text-slate-900"
              initial={{ scale: 0.5, opacity: 0 }}
              animate={{ scale: 1, opacity: 1 }}
              transition={{ duration: 0.5, delay: index * 0.1 + 0.2 }}
            >
              {value}
            </motion.p>
          </div>
          
          <motion.div
            className={`p-3 rounded-2xl bg-gradient-to-br ${getIconGradient()} shadow-lg`}
            whileHover={{ rotate: 360, scale: 1.1 }}
            transition={{ duration: 0.6 }}
          >
            <Icon className="w-6 h-6 text-white" />
          </motion.div>
        </div>

        {change !== undefined && (
          <div className="flex items-center gap-2">
            <span className={`inline-flex items-center gap-1 px-2.5 py-1 rounded-full text-xs font-semibold ${getTrendColor()}`}>
              {trend === 'up' && <ArrowUpIcon className="w-3 h-3" />}
              {trend === 'down' && <ArrowDownIcon className="w-3 h-3" />}
              {Math.abs(change).toFixed(1)}%
            </span>
            <span className="text-xs text-slate-500">vs last period</span>
          </div>
        )}
      </div>
    </motion.div>
  );
}
