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

export type SubscriptionName = 'free' | 'starter' | 'pro';

export interface SubscriptionFeatures {
  max_brands: number;           // -1 = unlimited
  max_pages: number;
  max_ad_accounts: number;
  content_limit: number;
  analytics: boolean;
  ai_digest: boolean;
  alerts: boolean;
  reports: boolean;
  team_members: number;
  influencer_tracking: boolean;
  instagram: boolean;
  tiktok: boolean;
  export: boolean;
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
  logo_url?: string;
  website?: string;
  industry?: string;
  is_active: boolean;
  subscription: Subscription | null;
  created_at: string;
  updated_at: string;
}

export enum UserRole {
  SUPER = 'SUPER',
  ADMIN = 'ADMIN',
  NORMAL = 'NORMAL',
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  brand_id: number;
  brand: Brand;
  is_active: boolean;
  is_email_verified: boolean;
  created_at: string;
  updated_at: string;
}

/** JWT session stored client-side after user login / register. */
export interface UserSession {
  access_token: string;
  token_type: 'bearer';
  user: User;
}

/** @deprecated Use UserSession instead. */
export type BrandSession = UserSession;

export interface BrandValidateResponse {
  valid: boolean;
  user_id: number;
  brand_id: number;
  brand_name: string;
  subscription: SubscriptionName;
  role: UserRole;
}

// ─── Instagram Types ──────────────────────────────────────────────────────────

export interface IGAccount {
  page_id: string;
  page_name: string;
  ig_user_id: string;
  username: string;
  name: string;
  biography: string;
  profile_picture_url: string;
  website: string;
  followers_count: number;
  follows_count: number;
  media_count: number;
}

export interface IGAccountsResponse {
  total: number;
  accounts: IGAccount[];
}

export interface IGMediaEngagement {
  likes: number;
  comments: number;
  views: number;
}

export type IGMediaType = 'IMAGE' | 'VIDEO' | 'CAROUSEL_ALBUM';
export type IGMediaProductType = 'FEED' | 'REELS' | 'STORY' | 'AD';

export interface IGMedia {
  id: string;
  caption: string;
  media_type: IGMediaType;
  media_product_type: IGMediaProductType;
  media_url: string;
  thumbnail_url: string;
  permalink: string;
  shortcode: string;
  timestamp: string;
  username: string;
  engagement: IGMediaEngagement;
  is_comment_enabled: boolean | null;
  is_shared_to_feed: boolean | null;
}

export interface IGMediaList {
  total: number;
  media: IGMedia[];
  paging: {
    cursors?: { before: string; after: string };
    next?: string;
  };
}

export interface IGMediaWithInsights extends IGMedia {
  insights: Record<string, number>;
}

export interface IGMediaInsights {
  media_product_type: IGMediaProductType;
  metrics: Record<string, number>;
}

export interface IGTimeSeriesPoint {
  value: number;
  end_time: string;
}

export interface IGEngagementTotals {
  total_interactions: number;
  likes: number;
  comments: number;
  shares: number;
  saves: number;
  reach: number;
  accounts_engaged: number;
}

export interface IGDemographics {
  gender_age: Record<string, number>;
  top_cities: Record<string, number>;
  top_countries: Record<string, number>;
  online_followers_by_hour: Record<string, number>;
}

export interface IGAccountSummary {
  ig_user_id: string;
  date_range: { since: string; until: string; days: number };
  engagement: IGEngagementTotals;
  time_series: Record<string, IGTimeSeriesPoint[]>;
  demographics: IGDemographics;
}

export interface IGComment {
  id: string;
  text: string;
  timestamp: string;
  username: string;
  like_count?: number;
  replies?: IGComment[];
}

// ─── TikTok Types ─────────────────────────────────────────────────────────────

export interface TikTokVideoEngagement {
  likes: number;
  comments: number;
  shares: number;
  views: number;
  total: number;
}

export interface TikTokVideo {
  id: string;
  title: string;
  description: string;
  created_at: number; // Unix timestamp (seconds)
  cover_image_url: string;
  share_url: string;
  duration: number;
  dimensions: { height: number; width: number };
  engagement: TikTokVideoEngagement;
  embed_html: string;
  embed_link: string;
}

export interface TikTokVideoList {
  open_id: string;
  display_name: string;
  total: number;
  videos: TikTokVideo[];
  paging: { cursor: number | null; has_more: boolean };
}

// ─── API Request / Response Types ─────────────────────────────────────────────

/** Response returned by GET /facebook/auth/login and GET /instagram/auth/connect. */
export interface OAuthLoginResponse {
  login_url: string;
  message: string;
}

/** Response returned by GET /facebook/auth/callback and GET /instagram/auth/callback. */
export interface OAuthCallbackResponse {
  success: boolean;
  session_id?: string;
}

export interface FacebookSessionResponse {
  connected: boolean;
  session_id: string | null;
  user_name: string | null;
  user_id?: string | null;
}

export interface InstagramSessionResponse {
  connected: boolean;
  session_id: string | null;
  ig_user_id: string | null;
  username: string | null;
}

export interface TikTokSessionResponse {
  connected: boolean;
  session_id: string | null;
  open_id: string | null;
  display_name: string | null;
}

export interface PlatformConnectionStatus {
  connected: boolean;
  user_name: string | null;
  loading: boolean;
}

export interface ConnectionStatuses {
  facebook: PlatformConnectionStatus;
  instagram: PlatformConnectionStatus;
  tiktok: PlatformConnectionStatus;
}

// ─── Unified Content Feed Types ───────────────────────────────────────────────

export interface ContentFeedStats {
  total_mentions: number;
  total_reach: number;
  total_interactions: number;
  negative_count: number;
  positive_count: number;
  neutral_count: number;
  positive_percentage: number;
}

export interface ContentFeedData {
  items: Mention[];
  total: number;
  page: number;
  page_size: number;
  has_more: boolean;
  platforms_fetched: MentionPlatform[];
  stats: ContentFeedStats;
}

export interface ContentFeedResponse {
  success: boolean;
  data: ContentFeedData;
}

export interface BrandRegisterPayload {
  name: string;
  email: string;
  password: string;
  subscription_name?: string;
  logo_url?: string;
  website?: string;
  industry?: string;
}

export interface BrandLoginPayload {
  email: string;
  password: string;
}

export interface AddUserPayload {
  name: string;
  email: string;
  password: string;
  role?: UserRole;
}

// ─── Invitation Types ─────────────────────────────────────────────────────────

export interface Invitation {
  id: number;
  email: string;
  brand_id: number;
  brand_name: string | null;
  role: UserRole;
  expires_at: string;
  accepted: boolean;
  created_at: string;
}

export interface InvitePayload {
  email: string;
  brand_id: number;
  role: UserRole;
}

export interface AcceptInvitePayload {
  token: string;
  name: string;
  password: string;
}

export interface InviteVerifyResponse {
  valid: boolean;
  email: string;
  brand_id: number;
  brand_name: string | null;
  role: UserRole;
  expires_at: string;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface AdminUsersResponse {
  success: boolean;
  total: number;
  users: User[];
}

export interface AdminBrandsResponse {
  success: boolean;
  total: number;
  brands: Brand[];
}

export interface CreateBrandPayload {
  name: string;
  website?: string;
  industry?: string;
  logo_url?: string;
}
