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
  reactions?: number;
  total: number;
}

export interface Post {
  id: string;
  message: string;
  story?: string;
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
  TWITTER: 'twitter',
  YOUTUBE: 'youtube',
  LINKEDIN: 'linkedin',
  BLUESKY: 'bluesky',
  REDDIT: 'reddit',
  NEWS: 'news',
  BLOGS: 'blogs',
  WEB: 'web',
  FORUMS: 'forums',
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

// ─── Mentions & Social Listening Types ──────────────────────────────────────

export type Sentiment = 'positive' | 'negative' | 'neutral';
export type Emotion = 'love' | 'joy' | 'fear' | 'anger' | 'sadness' | 'surprise' | 'disgust';
export type MentionPlatform =
  | 'twitter'
  | 'facebook'
  | 'instagram'
  | 'tiktok'
  | 'youtube'
  | 'linkedin'
  | 'bluesky'
  | 'reddit'
  | 'news'
  | 'blogs'
  | 'web'
  | 'forums';

export interface MentionAuthor {
  name: string;
  username: string;
  avatar?: string;
  followers: number;
  verified?: boolean;
}

export interface Mention {
  id: string;
  platform: MentionPlatform;
  author: MentionAuthor;
  content: string;
  url: string;
  created_at: string;
  sentiment: Sentiment;
  emotion?: Emotion;
  reach: number;
  interactions: number;
  performance: number; // 0–10
  language: string;
  country?: string;
  hashtags?: string[];
  image_url?: string;
}

export interface PlatformCount {
  platform: MentionPlatform;
  count: number;
}

export interface MentionStats {
  total_mentions: number;
  total_reach: number;
  total_interactions: number;
  negative_count: number;
  positive_count: number;
  neutral_count: number;
  positive_percentage: number;
}

// ─── Analytics types ─────────────────────────────────────────────────────────

export interface VolumeDataPoint {
  date: string;
  mentions: number;
  reach: number;
}

export interface SentimentDataPoint {
  date: string;
  positive: number;
  negative: number;
  neutral: number;
}

export interface InteractionDataPoint {
  date: string;
  interactions: number;
}

export interface TopCountry {
  country: string;
  count: number;
  flag?: string;
}

export interface TrendingConversation {
  phrase: string;
  count: number;
  sentiment?: Sentiment;
}

export interface TrendingHashtag {
  hashtag: string;
  count: number;
  sentiment?: Sentiment;
}

export interface Influencer {
  id: string;
  name: string;
  username: string;
  avatar?: string;
  platform: MentionPlatform;
  followers: number;
  mentions: number;
  reach: number;
  voice_share: number; // percentage
  performance: number; // 0–10
  sentiment: Sentiment;
}

export interface HeatmapCell {
  day: number;   // 0 = Mon … 6 = Sun
  hour: number;  // 0–23
  value: number;
}

export interface BrandConfig {
  id: string;
  name: string;
  color: string;
}

// ─── Brand Account & Subscription Types ──────────────────────────────────────

export type SubscriptionName = 'free' | 'starter' | 'pro' | 'enterprise';

export interface SubscriptionFeatures {
  max_brands: number;           // -1 = unlimited
  max_pages: number;
  max_ad_accounts: number;
  mentions_limit: number;
  analytics: boolean;
  ai_digest: boolean;
  alerts: boolean;
  reports: boolean;
  team_members: number;
  influencer_tracking: boolean;
  instagram: boolean;
  tiktok: boolean;
  export: boolean;
  custom_integrations?: boolean;
  dedicated_support?: boolean;
  sla?: boolean;
}

export interface Subscription {
  id: number;
  name: SubscriptionName;
  display_name: string;
  description: string;
  price_monthly: number;   // cents
  price_yearly: number;    // cents
  features: SubscriptionFeatures;
  is_active: boolean;
}

export interface Brand {
  id: number;
  name: string;
  email: string;
  logo_url?: string;
  website?: string;
  industry?: string;
  is_active: boolean;
  subscription: Subscription | null;
  created_at: string;
  updated_at: string;
}

/** JWT session stored client-side after brand login / register. */
export interface BrandSession {
  access_token: string;
  token_type: 'bearer';
  brand: Brand;
}

export interface BrandValidateResponse {
  valid: boolean;
  brand_id: number;
  brand_name: string;
  subscription: SubscriptionName;
}
