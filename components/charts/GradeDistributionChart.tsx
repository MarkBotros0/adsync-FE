'use client';

import {
  Bar,
  BarChart,
  CartesianGrid,
  ResponsiveContainer,
  Tooltip,
  XAxis,
  YAxis,
} from 'recharts';
import { useTheme } from '@/contexts/theme-context';
import type { PostGrade } from '@/lib/types';

interface GradeDistributionChartProps {
  distribution: Record<PostGrade, number>;
}

const GRADE_ORDER: PostGrade[] = ['A+', 'A', 'B', 'C', 'D'];

const GRADE_FILL: Record<PostGrade, string> = {
  'A+': '#10b981',
  'A': '#22c55e',
  'B': '#06b6d4',
  'C': '#f59e0b',
  'D': '#94a3b8',
};

/** Bar chart of the marketing-expert post-grade distribution (A+/A/B/C/D). */
export function GradeDistributionChart({ distribution }: GradeDistributionChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const grid = isDark ? '#251043' : '#e2e8f0';
  const tick = isDark ? '#9f7bc0' : '#64748b';
  const tooltipStyle = isDark
    ? { fontSize: 11, borderRadius: 6, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 11, borderRadius: 6 };

  const data = GRADE_ORDER.map((g) => ({ grade: g, count: distribution[g] ?? 0, fill: GRADE_FILL[g] }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="grade" tick={{ fontSize: 12, fill: tick }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tick }} />
        <Tooltip cursor={{ fill: 'rgba(148,163,184,0.12)' }} contentStyle={tooltipStyle} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
