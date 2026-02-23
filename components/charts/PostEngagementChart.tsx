'use client';

import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PostEngagementChartProps {
  posts: any[];
}

export function PostEngagementChart({ posts }: PostEngagementChartProps) {
  // Transform posts data for the chart
  const chartData = posts.slice(0, 5).map((post, index) => ({
    name: `Post ${index + 1}`,
    likes: post.engagement?.likes || 0,
    comments: post.engagement?.comments || 0,
    shares: post.engagement?.shares || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Post Engagement Breakdown</CardTitle>
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
            />
            <Tooltip 
              contentStyle={{
                backgroundColor: 'white',
                border: '1px solid #e2e8f0',
                borderRadius: '8px',
                padding: '12px'
              }}
            />
            <Legend />
            <Bar dataKey="likes" fill="#3b82f6" name="Likes" />
            <Bar dataKey="comments" fill="#10b981" name="Comments" />
            <Bar dataKey="shares" fill="#f59e0b" name="Shares" />
          </BarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
