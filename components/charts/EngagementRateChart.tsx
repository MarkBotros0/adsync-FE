'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Cell } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface EngagementRateChartProps {
  posts: any[];
  totalFollowers: number;
}

export function EngagementRateChart({ posts, totalFollowers }: EngagementRateChartProps) {
  // Calculate engagement rate for each post
  const chartData = posts.slice(0, 10).map((post, index) => {
    const totalEngagement = post.engagement?.total || 0;
    const engagementRate = totalFollowers > 0 
      ? ((totalEngagement / totalFollowers) * 100).toFixed(2)
      : 0;
    
    return {
      name: `Post ${index + 1}`,
      rate: parseFloat(engagementRate as string),
    };
  });

  // Color based on engagement rate
  const getColor = (rate: number) => {
    if (rate >= 5) return '#10b981'; // Green - Excellent
    if (rate >= 2) return '#3b82f6'; // Blue - Good
    if (rate >= 1) return '#f59e0b'; // Orange - Average
    return '#ef4444'; // Red - Low
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Rate by Post (%)</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="name" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
            />
            <YAxis 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              label={{ value: 'Rate (%)', angle: -90, position: 'insideLeft' }}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
              formatter={(value: any) => [`${value}%`, 'Engagement Rate']}
            />
            <Bar dataKey="rate" radius={[8, 8, 0, 0]}>
              {chartData.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={getColor(entry.rate)} />
              ))}
            </Bar>
          </BarChart>
        </ResponsiveContainer>
        <div className="mt-4 flex items-center justify-center gap-4 text-xs">
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-green-500" />
            <span>Excellent (≥5%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-blue-500" />
            <span>Good (2-5%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-orange-500" />
            <span>Average (1-2%)</span>
          </div>
          <div className="flex items-center gap-1">
            <div className="w-3 h-3 rounded bg-red-500" />
            <span>Low (&lt;1%)</span>
          </div>
        </div>
      </CardContent>
    </Card>
  );
}
