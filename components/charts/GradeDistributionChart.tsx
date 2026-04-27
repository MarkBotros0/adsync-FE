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
  const data = GRADE_ORDER.map((g) => ({ grade: g, count: distribution[g] ?? 0, fill: GRADE_FILL[g] }));

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={data} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" vertical={false} />
        <XAxis dataKey="grade" tick={{ fontSize: 12 }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12 }} />
        <Tooltip cursor={{ fill: 'rgba(148,163,184,0.12)' }} />
        <Bar dataKey="count" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
