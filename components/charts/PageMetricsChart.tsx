'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PageMetricsChartProps {
  metrics: {
    followers_count: number;
    fan_count: number;
    rating_count: number;
  };
}

export function PageMetricsChart({ metrics }: PageMetricsChartProps) {
  const data = [
    { name: 'Followers', value: metrics.followers_count || 0 },
    { name: 'Fans', value: metrics.fan_count || 0 },
    { name: 'Reviews', value: metrics.rating_count || 0 },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Page Metrics Overview</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <BarChart data={data} layout="vertical">
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis type="number" stroke="#64748b" style={{ fontSize: '12px' }} />
            <YAxis 
              type="category" 
              dataKey="name" 
              stroke="#64748b"
              style={{ fontSize: '12px' }}
              width={80}
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Bar dataKey="value" fill="#3b82f6" radius={[0, 8, 8, 0]} />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
