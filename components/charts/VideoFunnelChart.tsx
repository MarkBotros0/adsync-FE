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

interface VideoFunnelChartProps {
  /** Counts at each retention milestone — pulled straight off ads insights row(s). */
  metrics: {
    video_views?: number;
    video_p25?: number;
    video_p50?: number;
    video_p75?: number;
    video_p95?: number;
    video_p100?: number;
  };
}

/** Funnel bars: View → 25% → 50% → 75% → 95% → 100%. */
export function VideoFunnelChart({ metrics }: VideoFunnelChartProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';
  const grid = isDark ? '#251043' : '#e2e8f0';
  const tick = isDark ? '#9f7bc0' : '#64748b';
  const tooltipStyle = isDark
    ? { fontSize: 11, borderRadius: 6, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 11, borderRadius: 6 };

  const rows = [
    { stage: 'Views', count: metrics.video_views ?? 0 },
    { stage: '25%', count: metrics.video_p25 ?? 0 },
    { stage: '50%', count: metrics.video_p50 ?? 0 },
    { stage: '75%', count: metrics.video_p75 ?? 0 },
    { stage: '95%', count: metrics.video_p95 ?? 0 },
    { stage: '100%', count: metrics.video_p100 ?? 0 },
  ];

  return (
    <ResponsiveContainer width="100%" height={220}>
      <BarChart data={rows} margin={{ top: 8, right: 16, left: 0, bottom: 0 }}>
        <CartesianGrid strokeDasharray="3 3" stroke={grid} vertical={false} />
        <XAxis dataKey="stage" tick={{ fontSize: 12, fill: tick }} />
        <YAxis allowDecimals={false} tick={{ fontSize: 12, fill: tick }} />
        <Tooltip contentStyle={tooltipStyle} />
        <Bar dataKey="count" fill="#06b6d4" radius={[6, 6, 0, 0]} />
      </BarChart>
    </ResponsiveContainer>
  );
}
