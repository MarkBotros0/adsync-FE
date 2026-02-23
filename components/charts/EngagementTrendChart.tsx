'use client';

import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { format } from 'date-fns';

interface EngagementTrendChartProps {
  posts: any[];
}

export function EngagementTrendChart({ posts }: EngagementTrendChartProps) {
  // Sort posts by date and create trend data
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(a.created_time).getTime() - new Date(b.created_time).getTime()
  );

  const chartData = sortedPosts.map((post) => ({
    date: format(new Date(post.created_time), 'MMM dd'),
    engagement: post.engagement?.total || 0,
    likes: post.engagement?.likes || 0,
    comments: post.engagement?.comments || 0,
    shares: post.engagement?.shares || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Trend Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <LineChart data={chartData}>
            <CartesianGrid strokeDasharray="3 3" stroke="#e2e8f0" />
            <XAxis 
              dataKey="date" 
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
            <Line 
              type="monotone" 
              dataKey="engagement" 
              stroke="#8b5cf6" 
              strokeWidth={2}
              name="Total Engagement"
              dot={{ fill: '#8b5cf6', r: 4 }}
            />
            <Line 
              type="monotone" 
              dataKey="likes" 
              stroke="#3b82f6" 
              strokeWidth={2}
              name="Likes"
              dot={{ fill: '#3b82f6', r: 3 }}
            />
            <Line 
              type="monotone" 
              dataKey="comments" 
              stroke="#10b981" 
              strokeWidth={2}
              name="Comments"
              dot={{ fill: '#10b981', r: 3 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
