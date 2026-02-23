// Session types
export interface Session {
  sessionId: string;
  userId: string;
  userName: string;
  valid: boolean;
  expiresAt?: number;
  scopes?: string[];
}

export interface AuthStatus {
  valid: boolean;
  user_id: string;
  user_name: string;
  expires_at?: number;
  scopes?: string[];
}

// Facebook Page types
export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  tasks?: string[];
}

export interface PageMetrics {
  fan_count: number;
  followers_count: number;
  rating: number;
  rating_count: number;
}

export interface PageInfo {
  category: string;
  link: string;
  website: string;
  about: string;
  phone: string;
}

export interface PageInsights {
  page_id: string;
  page_name: string;
  metrics: PageMetrics;
  page_info: PageInfo;
}

// Post types
export interface PostEngagement {
  likes: number;
  comments: number;
  shares: number;
  total: number;
}

export interface Post {
  id: string;
  message: string;
  created_time: string;
  permalink_url: string;
  type?: 'text' | 'photo' | 'video' | 'link';
  engagement?: PostEngagement;
}

// Ad Insights types
export interface AdInsightData {
  clicks: number;
  impressions: number;
  spend: number;
  ctr: number;
}

export interface AdInsightsSummary {
  total_rows: number;
  average_ctr: number;
  total_clicks: number;
  total_impressions: number;
  total_spend: number;
}

export interface AdInsights {
  account_id: string;
  insights: AdInsightData[];
  summary: AdInsightsSummary;
}

// Chart data types
export interface EngagementChartData {
  date: string;
  impressions: number;
  engagement: number;
  reach: number;
}

export interface PerformanceChartData {
  name: string;
  clicks: number;
  impressions: number;
  spend: number;
}

// Platform types
export const PLATFORMS = {
  FACEBOOK: 'facebook',
  INSTAGRAM: 'instagram',
  TIKTOK: 'tiktok',
} as const;

export type Platform = typeof PLATFORMS[keyof typeof PLATFORMS];

// Date range types
export interface DateRange {
  from: Date;
  to: Date;
}

export interface DatePreset {
  id: string;
  label: string;
  days: number;
}

// API Response types
export interface ApiResponse<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

export interface PagesResponse {
  user_id: string;
  user_name: string;
  total_pages: number;
  pages: FacebookPage[];
}

export interface PostsResponse {
  page_id: string;
  total_posts: number;
  posts: Post[];
  paging?: {
    next?: string;
    previous?: string;
  };
}
