'use client';

import { useState } from 'react';
import { motion } from 'framer-motion';
import { CalendarIcon } from '@heroicons/react/24/outline';
import { DateRange } from '@/lib/types';

interface DateFilterProps {
  onChange: (range: DateRange) => void;
}

const presets = [
  { id: '7d', label: '7 days', days: 7 },
  { id: '30d', label: '30 days', days: 30 },
  { id: '90d', label: '90 days', days: 90 },
];

export function DateFilter({ onChange }: DateFilterProps) {
  const [selected, setSelected] = useState('7d');

  const handleSelect = (presetId: string) => {
    setSelected(presetId);
    const preset = presets.find(p => p.id === presetId);
    if (preset) {
      const to = new Date();
      const from = new Date();
      from.setDate(from.getDate() - preset.days);
      onChange({ from, to });
    }
  };

  return (
    <div className="flex items-center gap-3">
      <div className="flex items-center gap-2 px-4 py-2 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg">
        <CalendarIcon className="w-5 h-5 text-slate-500" />
        <span className="text-sm font-medium text-slate-700">Time Range</span>
      </div>
      
      <div className="flex gap-2 p-1 rounded-2xl bg-white/80 backdrop-blur-xl border border-slate-200/60 shadow-lg">
        {presets.map(({ id, label }) => (
          <motion.button
            key={id}
            onClick={() => handleSelect(id)}
            className={`
              relative px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300
              ${selected === id 
                ? 'text-white' 
                : 'text-slate-600 hover:text-slate-900'
              }
            `}
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {selected === id && (
              <motion.div
                layoutId="activePreset"
                className="absolute inset-0 bg-gradient-to-r from-blue-500 to-indigo-600 rounded-xl shadow-lg"
                initial={false}
                transition={{ type: "spring", stiffness: 500, damping: 30 }}
              />
            )}
            <span className="relative z-10">{label}</span>
          </motion.button>
        ))}
      </div>
    </div>
  );
}
