export interface Session {
  sessionId: string;
  userId: string;
  userName: string;
  valid: boolean;
}

export interface FacebookPage {
  id: string;
  name: string;
  access_token: string;
  category?: string;
  tasks?: string[];
}

export interface PageInsights {
  page_id: string;
  page_name: string;
  metrics: {
    fan_count: number;
    followers_count: number;
    rating: number;
    rating_count: number;
  };
  page_info: {
    category: string;
    link: string;
    website: string;
    about: string;
    phone: string;
  };
}

export interface Post {
  id: string;
  message: string;
  created_time: string;
  permalink_url: string;
  engagement?: {
    likes: number;
    comments: number;
    shares: number;
    total: number;
  };
}

export interface AdInsights {
  account_id: string;
  insights: Array<{
    clicks: number;
    impressions: number;
    spend: number;
    ctr: number;
  }>;
  summary: {
    total_rows: number;
    average_ctr: number;
    total_clicks: number;
    total_impressions: number;
    total_spend: number;
  };
}

export type Platform = 'facebook' | 'instagram' | 'tiktok';

export interface DateRange {
  from: Date;
  to: Date;
}
