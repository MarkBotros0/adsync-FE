'use client';

import { RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, ResponsiveContainer, Legend } from 'recharts';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/Card';

interface PostPerformanceChartProps {
  posts: any[];
}

export function PostPerformanceChart({ posts }: PostPerformanceChartProps) {
  // Calculate average metrics
  const totalPosts = posts.length || 1;
  const avgLikes = posts.reduce((sum, post) => sum + (post.engagement?.likes || 0), 0) / totalPosts;
  const avgComments = posts.reduce((sum, post) => sum + (post.engagement?.comments || 0), 0) / totalPosts;
  const avgShares = posts.reduce((sum, post) => sum + (post.engagement?.shares || 0), 0) / totalPosts;
  
  // Find best performing post
  const bestPost = posts.reduce((best, post) => {
    const currentTotal = post.engagement?.total || 0;
    const bestTotal = best.engagement?.total || 0;
    return currentTotal > bestTotal ? post : best;
  }, posts[0] || {});

  const data = [
    {
      metric: 'Likes',
      average: avgLikes,
      best: bestPost.engagement?.likes || 0,
    },
    {
      metric: 'Comments',
      average: avgComments,
      best: bestPost.engagement?.comments || 0,
    },
    {
      metric: 'Shares',
      average: avgShares,
      best: bestPost.engagement?.shares || 0,
    },
  ];

  return (
    <Card>
      <CardHeader>
        <CardTitle>Performance Comparison</CardTitle>
      </CardHeader>
      <CardContent>
        <ResponsiveContainer width="100%" height={300}>
          <RadarChart data={data}>
            <PolarGrid stroke="#e2e8f0" />
            <PolarAngleAxis 
              dataKey="metric" 
              style={{ fontSize: '12px', fill: '#64748b' }}
            />
            <PolarRadiusAxis style={{ fontSize: '10px' }} />
            <Radar 
              name="Average" 
              dataKey="average" 
              stroke="#3b82f6" 
              fill="#3b82f6" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Radar 
              name="Best Post" 
              dataKey="best" 
              stroke="#10b981" 
              fill="#10b981" 
              fillOpacity={0.3}
              strokeWidth={2}
            />
            <Legend />
          </RadarChart>
        </ResponsiveContainer>
      </CardContent>
    </Card>
  );
}
