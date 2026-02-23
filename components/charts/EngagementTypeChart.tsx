'use client';

import { AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';
import { format } from 'date-fns';

interface EngagementTypeChartProps {
  posts: any[];
}

export function EngagementTypeChart({ posts }: EngagementTypeChartProps) {
  // Sort posts by date
  const sortedPosts = [...posts].sort((a, b) => 
    new Date(a.created_time).getTime() - new Date(b.created_time).getTime()
  );

  const chartData = sortedPosts.map((post) => ({
    date: format(new Date(post.created_time), 'MMM dd'),
    likes: post.engagement?.likes || 0,
    comments: post.engagement?.comments || 0,
    shares: post.engagement?.shares || 0,
  }));

  return (
    <Card>
      <CardHeader>
        <CardTitle>Engagement Types Over Time</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <AreaChart data={chartData}>
            <defs>
              <linearGradient id="colorLikes" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#3b82f6" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#3b82f6" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorComments" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#10b981" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#10b981" stopOpacity={0}/>
              </linearGradient>
              <linearGradient id="colorShares" x1="0" y1="0" x2="0" y2="1">
                <stop offset="5%" stopColor="#f59e0b" stopOpacity={0.8}/>
                <stop offset="95%" stopColor="#f59e0b" stopOpacity={0}/>
              </linearGradient>
            </defs>
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
            <Area 
              type="monotone" 
              dataKey="likes" 
              stackId="1"
              stroke="#3b82f6" 
              fill="url(#colorLikes)"
              name="Likes"
            />
            <Area 
              type="monotone" 
              dataKey="comments" 
              stackId="1"
              stroke="#10b981" 
              fill="url(#colorComments)"
              name="Comments"
            />
            <Area 
              type="monotone" 
              dataKey="shares" 
              stackId="1"
              stroke="#f59e0b" 
              fill="url(#colorShares)"
              name="Shares"
            />
          </AreaChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
