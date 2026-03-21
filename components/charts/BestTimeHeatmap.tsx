'use client';

import { useMemo } from 'react';
import { Download, Sparkles } from 'lucide-react';
import { generateHeatmapData } from '@/lib/mock-data';
import type { HeatmapCell } from '@/lib/types';
import { useTheme } from '@/contexts/theme-context';

const DAYS = ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'];

function getColor(value: number, isDark: boolean): string {
  if (value >= 45) return '#581c87'; // very dark purple — same in both modes
  if (value >= 30) return '#7c3aed';
  if (value >= 20) return '#a855f7';
  if (value >= 10) return '#c4b5fd';
  if (value >= 5)  return isDark ? '#3b1f6a' : '#ede9fe';
  return isDark ? '#251043' : '#f8fafc';
}

export function BestTimeHeatmap({ data: propData }: { data?: HeatmapCell[] }) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const mockData = useMemo(() => generateHeatmapData(), []);
  const data = propData ?? mockData;

  // Group by day
  const byDay: Record<number, typeof data> = {};
  data.forEach(cell => {
    if (!byDay[cell.day]) byDay[cell.day] = [];
    byDay[cell.day].push(cell);
  });

  // Find peak
  const peak = data.reduce((max, c) => c.value > max.value ? c : max, data[0]);
  const peakHour = peak.hour >= 12
    ? `${peak.hour === 12 ? 12 : peak.hour - 12} PM`
    : `${peak.hour === 0 ? 12 : peak.hour} AM`;
  const peakDay = DAYS[peak.day];

  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Best Time To Post</h3>
          <p className="text-xs text-slate-500 dark:text-purple-400">
            Mentions peak on{' '}
            <span className="text-purple-600 dark:text-purple-300 font-medium">
              {peakDay}s at {peakHour}
            </span>
          </p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-purple-600 dark:text-purple-400 hover:text-purple-800 dark:hover:text-purple-200 font-medium border border-purple-200 dark:border-purple-800 px-2.5 py-1 rounded-lg transition-colors">
            <Sparkles className="h-3 w-3" />
            Run AI Analysis
          </button>
          <button className="text-slate-400 dark:text-purple-500 hover:text-slate-600 dark:hover:text-purple-300">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      <div className="p-5 overflow-x-auto">
        {/* Hour labels */}
        <div className="flex items-center mb-2 ml-10">
          {Array.from({ length: 24 }, (_, h) => (
            <div key={h} className="flex-1 text-center" style={{ minWidth: 12 }}>
              {h % 6 === 0 ? (
                <span className="text-[9px] text-slate-400 dark:text-purple-500">
                  {h === 0 ? '12A' : h === 6 ? '6A' : h === 12 ? '12P' : h === 18 ? '6P' : ''}
                </span>
              ) : null}
            </div>
          ))}
        </div>

        {/* Grid */}
        {DAYS.map((day, dayIdx) => (
          <div key={day} className="flex items-center mb-1">
            <span className="text-[11px] text-slate-500 dark:text-purple-400 w-10 shrink-0">{day}</span>
            <div className="flex flex-1 gap-0.5">
              {(byDay[dayIdx] || []).sort((a, b) => a.hour - b.hour).map(cell => (
                <div
                  key={cell.hour}
                  title={`${DAYS[cell.day]} ${cell.hour}:00 — ${cell.value} mentions`}
                  className="flex-1 h-5 rounded-sm cursor-pointer hover:ring-1 hover:ring-purple-400 transition-all"
                  style={{
                    minWidth: 10,
                    background: getColor(cell.value, isDark),
                  }}
                />
              ))}
            </div>
          </div>
        ))}

        {/* Legend */}
        <div className="flex items-center gap-1.5 mt-3 ml-10">
          <span className="text-[10px] text-slate-400 dark:text-purple-500">Less</span>
          {[0, 5, 12, 22, 35, 50].map(v => (
            <div key={v} className="h-3 w-4 rounded-sm" style={{ background: getColor(v, isDark) }} />
          ))}
          <span className="text-[10px] text-slate-400 dark:text-purple-500">More</span>
        </div>
      </div>
    </div>
  );
}
