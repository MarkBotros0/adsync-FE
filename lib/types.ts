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
  post_format?: string;
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
  reach?: number;
  likes?: number;
  comments?: number;
  saves?: number;
  shares?: number;
}

export type InteractionFilter = 'all' | 'likes' | 'comments' | 'saves' | 'shares';

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

export interface PostFormatDataPoint {
  format: string;
  interactions: number;
  reach: number;
  count: number;
}

export interface FollowersGrowthDataPoint {
  date: string;
  followers: number;
  growth_rate: number; // % growth from first day in range
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
  organization_id: number | null;
  subscription: Subscription | null;
  created_at: string;
  updated_at: string;
}

export interface Organization {
  id: number;
  name: string;
  logo_url?: string;
  is_active: boolean;
  subscription: Subscription | null;
  brand_count?: number;
  max_brands?: number;
  created_at: string;
  updated_at: string;
}

/** A brand entry in the brand switcher list. */
export interface BrandSwitcherEntry {
  id: number;
  name: string;
  logo_url?: string;
  role: UserRole;
}

export enum UserRole {
  SUPER = 'SUPER',
  ORG_ADMIN = 'ORG_ADMIN',
  ADMIN = 'ADMIN',   // legacy
  NORMAL = 'NORMAL',
}

export interface User {
  id: number;
  email: string;
  name: string;
  role: UserRole;
  /** Brand-scoped effective role from /admin/brands/{id}/users — NORMAL or ORG_ADMIN. */
  effective_role?: UserRole;
  org_id: number | null;
  org_name: string | null;
  brand_id: number | null;
  brand: Brand | null;
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
  requires_brand_creation?: boolean;
  requires_brand_selection?: boolean;
  selection_token?: string;
  brands?: BrandSwitcherEntry[];
}

/** @deprecated Use UserSession instead. */
export type BrandSession = UserSession;

export interface BrandValidateResponse {
  valid: boolean;
  user_id: number;
  org_id: number;
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
  org_name: string;
  name: string;
  email: string;
  password: string;
  subscription_name?: string;
}

export interface BrandLoginPayload {
  email: string;
  password: string;
}

export interface ForgotPasswordPayload {
  email: string;
}

export interface ResetPasswordPayload {
  email: string;
  code: string;
  new_password: string;
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
  role: UserRole;
  brand_id?: number;   // required for NORMAL; omitted for ORG_ADMIN
}

export interface AcceptInvitePayload {
  token: string;
  name: string;
  password: string;
}

export interface InviteVerifyResponse {
  valid: boolean;
  email: string;
  brand_id: number | null;
  brand_name: string | null;
  organization_id: number | null;
  org_name: string | null;
  role: UserRole;
  expires_at: string;
}

// ─── Per-Post Insights Types ──────────────────────────────────────────────────

export interface PostTrafficSource {
  source: string;
  percentage: number;
}

export interface PostAgeGender {
  age_range: string;
  men_pct: number;
  women_pct: number;
  total_pct: number;
}

export interface PostCountryData {
  country: string;
  percentage: number;
  flag?: string;
}

export interface PostInsights {
  platform: MentionPlatform;
  post_id: string;
  views: number;
  reach?: number;
  impressions?: number;
  followers_pct?: number;
  non_followers_pct?: number;
  net_follows?: number;
  likes: number;
  comments: number;
  shares: number;
  saves?: number;
  follows?: number;
  total_interactions: number;
  avg_watch_time_sec?: number;
  three_sec_views?: number;
  one_min_views?: number;
  total_watch_time_sec?: number;
  traffic_sources?: PostTrafficSource[];
  age_gender?: PostAgeGender[];
  countries?: PostCountryData[];
  media_product_type?: string;
}

// ─── Admin Types ──────────────────────────────────────────────────────────────

export interface AdminInvitationsResponse {
  success: boolean;
  total: number;
  invitations: Invitation[];
}

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

// ─── Competitor Analysis Types ────────────────────────────────────────────────

export type CompetitorActorKey =
  | 'facebook_ads'
  | 'website'
  | 'google_search'
  | 'instagram'
  | 'tiktok'
  | 'google_places';

export type CompetitorJobStatus =
  | 'pending'
  | 'running'
  | 'completed'
  | 'partial'
  | 'failed';

export type CompetitorActorStatus =
  | 'idle'        // no result row yet — user hasn't clicked Run
  | 'pending'     // queued, orchestrator not started yet
  | 'running'     // actor is executing
  | 'completed'
  | 'failed';

export interface CompetitorJobSummary {
  id: number;
  status: CompetitorJobStatus;
  actors_total: number | null;
  actors_done: number;
  actors_failed: number;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export type CompetitorTargetType = 'url' | 'handle' | 'query' | 'page_name';

export interface CompetitorTarget {
  actor_key: CompetitorActorKey;
  target_value: string;
  target_type: CompetitorTargetType;
  is_enabled: boolean;
  last_run_at: string | null;
  last_cost_usd: number | null;
}

export interface CompetitorTargetInput {
  actor_key: CompetitorActorKey;
  target_value: string;
  target_type: CompetitorTargetType;
  is_enabled?: boolean;
}

export interface Competitor {
  id: number;
  name: string;
  slug: string;
  created_at: string;
  updated_at: string;
  last_job: CompetitorJobSummary | null;
  targets: CompetitorTarget[];
  summaries?: Partial<Record<CompetitorActorKey, CompetitorActorSummary>> | null;
}

export interface CompetitorCreatePayload {
  name: string;
  targets: CompetitorTargetInput[];
}

// ── Cost & budget ─────────────────────────────────────────────────────────────

export interface EstimatedCost {
  actor_key: CompetitorActorKey;
  avg_compute_units: number | null;
  avg_usage_usd: number | null;
  low_usd: number | null;
  high_usd: number | null;
  samples: number;
  basis: 'rolling-avg' | 'global-avg' | 'no-data';
}

export interface BudgetSnapshot {
  used_compute_units: number;
  used_usd: number;
  monthly_compute_unit_budget: number | null;
  warn_at_pct: number;
  percent_used: number | null;
  will_warn: boolean;
  will_block: boolean;
  period_start: string;
}

export interface BrandUsage {
  period_start: string;
  compute_units_used: number;
  usage_usd: number;
  runs: number;
  by_actor: Record<string, { compute_units: number; usage_usd: number; runs: number }>;
  budget: BudgetSnapshot;
}

export interface ApifyRunRecord {
  id: number;
  actor_key: CompetitorActorKey;
  apify_run_id: string | null;
  competitor_id: number | null;
  status: string;
  compute_units: number | null;
  usage_total_usd: number | null;
  started_at: string | null;
  finished_at: string | null;
  created_at: string;
}

export interface ApifyRunListResponse {
  items: ApifyRunRecord[];
  next_cursor: number | null;
  limit: number;
}

// ── Pandas summary cards ──────────────────────────────────────────────────────

export interface MetaAdsSummary {
  total: number;
  filtered_total: number;
  ads_active: number;
  ads_with_video: number;
  median_run_days: number | null;
  p90_run_days: number | null;
  ads_per_week: Record<string, number>;
  platforms_breakdown: Record<string, number>;
  regions_top: Record<string, number>;
  cta_breakdown: Record<string, number>;
  page_concentration: number | null;
  top_pages: Record<string, number>;
}

export interface InstagramSummary {
  total: number;
  filtered_total: number;
  followers: number;
  engagement_rate: number | null;
  posts_per_week: Record<string, number>;
  top_hashtags: Record<string, number>;
  type_breakdown: Record<string, number>;
  median_likes: number | null;
  p90_likes: number | null;
  median_comments: number | null;
  like_to_comment_ratio_p90: number | null;
  peak_post_hour: number | null;
}

export interface TikTokSummary {
  total: number;
  filtered_total: number;
  followers: number;
  hearts: number;
  videos_per_week: Record<string, number>;
  median_plays: number | null;
  p90_plays: number | null;
  median_likes: number | null;
  like_per_play_p50: number | null;
  share_to_play_p90: number | null;
  avg_duration: number | null;
  top_hashtags: Record<string, number>;
  music_share: number | null;
}

export interface MetaAdsFilters {
  status?: 'all' | 'active' | 'inactive';
  has_video?: boolean;
  platform?: string;
  cta?: string;
  page_name?: string;
  search?: string;
}

export interface InstagramFilters {
  type?: string;
  has_caption?: boolean;
  hashtag?: string;
  search?: string;
}

export interface TikTokFilters {
  has_music?: boolean;
  hashtag?: string;
  search?: string;
  min_duration?: number;
  max_duration?: number;
}

// ── Per-actor summaries (compact, used in list / cards) ───────────────────────

export interface CompetitorActorSummary {
  ads_total?: number;
  ads_active?: number;
  pages?: string[];
  pages_count?: number;
  homepage_title?: string | null;
  homepage_description?: string | null;
  total_words?: number;
  results_count?: number;
  top_domain?: string | null;
  top_url?: string | null;
  people_also_ask?: string[];
  top_username?: string | null;
  followers?: number;
  posts_count?: number;
  matches?: number;
  videos_count?: number;
  total_plays?: number;
  places_count?: number;
  average_rating?: number | null;
  total_reviews?: number;
}

// ── Per-actor data shapes (what each tab renders) ─────────────────────────────

export interface FacebookAdResult {
  id: string | null;
  page_name: string | null;
  page_url: string | null;
  body: string | null;
  cta: string | null;
  link_url: string | null;
  start_date: string | null;
  end_date: string | null;
  is_active: boolean | null;
  platforms: string[];
  regions: unknown[];
  media: { url: string; type: 'image' | 'video' }[];
}

export interface WebsitePageResult {
  url: string | null;
  title: string | null;
  description: string | null;
  headings: string[];
  word_count: number;
  excerpt: string | null;
}

export interface GoogleSearchOrganicResult {
  rank: number | null;
  title: string | null;
  url: string | null;
  domain: string | null;
  description: string | null;
}

export interface GoogleSearchData {
  organic: GoogleSearchOrganicResult[];
  people_also_ask: string[];
  related: string[];
}

export interface InstagramProfileResult {
  username: string | null;
  full_name: string | null;
  biography: string | null;
  followers: number;
  follows: number;
  posts_count: number;
  is_verified: boolean;
  profile_pic_url: string | null;
  external_url: string | null;
}

export interface InstagramPostResult {
  id: string | null;
  shortcode: string | null;
  url: string | null;
  type: string | null;
  caption: string | null;
  likes: number;
  comments: number;
  video_views: number;
  timestamp: string | null;
  display_url: string | null;
  owner_username: string | null;
}

export interface InstagramData {
  profiles: InstagramProfileResult[];
  posts: InstagramPostResult[];
}

export interface TikTokAuthorResult {
  username: string;
  nickname: string | null;
  followers: number;
  following: number;
  hearts: number;
  video_count: number;
  verified: boolean;
  avatar: string | null;
  signature: string | null;
}

export interface TikTokVideoResult {
  id: string | null;
  url: string | null;
  description: string | null;
  create_time: string | null;
  duration: number;
  cover: string | null;
  plays: number;
  likes: number;
  comments: number;
  shares: number;
  author: string | null;
  music_name: string | null;
  hashtags: string[];
}

export interface TikTokData {
  authors: TikTokAuthorResult[];
  videos: TikTokVideoResult[];
}

export interface GooglePlaceReview {
  name: string | null;
  rating: number;
  text: string | null;
  published_at: string | null;
}

export interface GooglePlaceResult {
  id: string | null;
  name: string | null;
  category: string | null;
  address: string | null;
  city: string | null;
  country: string | null;
  phone: string | null;
  website: string | null;
  rating: number | null;
  reviews_count: number;
  lat: number | null;
  lng: number | null;
  url: string | null;
  image_url: string | null;
  reviews: GooglePlaceReview[];
}

// ── Generic actor result wrapper ──────────────────────────────────────────────

export interface CompetitorActorResult<TData = unknown> {
  actor_key: CompetitorActorKey;
  status: CompetitorActorStatus;
  summary: CompetitorActorSummary | null;
  data: TData | null;
  error: string | null;
  started_at: string | null;
  finished_at: string | null;
}

export interface CompetitorJobStatusResponse {
  id: number;
  status: CompetitorJobStatus;
  actors_total: number;
  actors_done: number;
  actors_failed: number;
  started_at: string | null;
  finished_at: string | null;
  actors: CompetitorActorResult[];
}

export interface CompetitorResultsResponse {
  competitor: Competitor;
  job: CompetitorJobSummary | null;
  results: {
    facebook_ads: CompetitorActorResult<FacebookAdResult[]>;
    website: CompetitorActorResult<WebsitePageResult[]>;
    google_search: CompetitorActorResult<GoogleSearchData>;
    instagram: CompetitorActorResult<InstagramData>;
    tiktok: CompetitorActorResult<TikTokData>;
    google_places: CompetitorActorResult<GooglePlaceResult[]>;
  };
}

export interface CompetitorListResponse {
  total: number;
  competitors: Competitor[];
}

export interface CompetitorCreateResponse {
  competitor: Competitor;
}

export interface CompetitorJobCreatedResponse {
  job_id: number;
  status: CompetitorJobStatus;
  actor_key: CompetitorActorKey | null;
  estimated_cost_usd: number | null;
}

export interface ActorResultEnvelope<TData = unknown> {
  actor_key: CompetitorActorKey;
  result: CompetitorActorResult<TData>;
  job: CompetitorJobSummary | null;
}

export interface ActorSummaryEnvelope<TSummary = unknown> {
  actor_key: CompetitorActorKey;
  summary: TSummary;
}

export interface CompetitorTargetsResponse {
  targets: CompetitorTarget[];
  default_target_types: Partial<Record<CompetitorActorKey, CompetitorTargetType>>;
  allowed_target_types: Partial<Record<CompetitorActorKey, CompetitorTargetType[]>>;
}

/** Generic envelope used by every Competitor Analysis endpoint. */
export interface CompetitorEnvelope<T> {
  success: boolean;
  data: T;
  message?: string;
  error?: string;
}

// ─── Marketing-expert analytics types (drives the analytics rebuild) ──────

export type PostGrade = 'A+' | 'A' | 'B' | 'C' | 'D';

/** Top-of-page KPI tile row from the marketing-expert spec. */
export interface TopOfPageKPIs {
  followers_growth_rate_pct: number | null;
  avg_total_engagements_per_post: number;
  avg_likes_per_post: number;
  avg_reach_per_post: number;
  avg_saves_per_post: number;
  avg_shares_per_post: number;
}

export interface AnalyticsOverviewData {
  top_of_page: TopOfPageKPIs;
  engagement_rate_per_reach_pct: number | null;
  interactions_per_1k_followers: number | null;
  total_saves: number;
  grade_distribution: Record<PostGrade, number>;
  graded_posts: { id: string; platform: string; score: number; grade: PostGrade | null }[];
}

export interface CampaignTag {
  id: number;
  brand_id: number;
  name: string;
  slug: string;
  color: string;
  description: string | null;
}

export type DraftStatus =
  | 'draft' | 'pending_approval' | 'scheduled'
  | 'publishing' | 'published' | 'failed';

export interface PublishDraft {
  id: number;
  brand_id: number;
  author_user_id: number;
  status: DraftStatus;
  scheduled_at: string | null;
  text: string;
  platforms_json: string[];
  per_platform_payload_json: Record<string, Record<string, unknown>>;
  media_asset_ids_json: number[];
  campaign_tag_ids_json: number[];
  approved_at: string | null;
  rejection_reason: string | null;
  published_at: string | null;
  platform_post_ids_json: Record<string, string> | null;
  error_message: string | null;
  created_at: string;
  updated_at: string;
}

export interface MediaAssetSummary {
  id: number;
  brand_id: number;
  kind: 'image' | 'video';
  filename: string;
  mime: string;
  size_bytes: number;
  width: number | null;
  height: number | null;
  duration_seconds: number | null;
  created_at: string;
}

export interface BrandIdentity {
  id: number;
  brand_id: number;
  primary_color: string;
  secondary_color: string;
  font_family: string;
  white_label_subdomain: string | null;
  has_logo: boolean;
}

export interface ReportRunSummary {
  id: number;
  brand_id: number;
  schedule_id: number | null;
  status: 'pending' | 'generating' | 'ready' | 'failed';
  period_start: string;
  period_end: string;
  generated_at: string | null;
  delivered_at: string | null;
  error_message: string | null;
}

export interface ReportSchedule {
  id: number;
  brand_id: number;
  name: string;
  cadence: 'weekly' | 'monthly';
  recipients_csv: string;
  template_json: Record<string, unknown>;
  last_sent_at: string | null;
  next_sent_at: string;
}

export interface InstagramCommentAnalysis {
  media_id: string;
  summary: {
    total: number;
    positive: number;
    neutral: number;
    negative: number;
    positive_pct: number;
    negative_pct: number;
  };
  comments: {
    id: string; text: string; timestamp: string; username: string;
    like_count: number; sentiment: 'positive' | 'neutral' | 'negative';
    replies?: { id: string; text: string; sentiment: 'positive' | 'neutral' | 'negative' }[];
  }[];
}
