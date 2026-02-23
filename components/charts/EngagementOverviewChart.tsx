'use client';

import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface EngagementOverviewChartProps {
  posts: any[];
}

const COLORS = ['#3b82f6', '#10b981', '#f59e0b'];

export function EngagementOverviewChart({ posts }: EngagementOverviewChartProps) {
  // Calculate total engagement metrics
  const totalLikes = posts.reduce((sum, post) => sum + (post.engagement?.likes || 0), 0);
  const totalComments = posts.reduce((sum, post) => sum + (post.engagement?.comments || 0), 0);
  const totalShares = posts.reduce((sum, post) => sum + (post.engagement?.shares || 0), 0);

  const data = [
    { name: 'Likes', value: totalLikes },
    { name: 'Comments', value: totalComments },
    { name: 'Shares', value: totalShares },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Total Engagement Distribution</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <PieChart>
            <Pie
              data={data}
              cx="50%"
              cy="50%"
              labelLine={false}
              label={({ name, percent }) => `${name}: ${((percent || 0) * 100).toFixed(0)}%`}
              outerRadius={80}
              fill="#8884d8"
              dataKey="value"
            >
              {data.map((entry, index) => (
                <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend />
          </PieChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
