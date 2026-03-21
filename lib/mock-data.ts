import type {
  Mention,
  VolumeDataPoint,
  SentimentDataPoint,
  InteractionDataPoint,
  TopCountry,
  TrendingConversation,
  TrendingHashtag,
  Influencer,
  HeatmapCell,
  PlatformCount,
  MentionStats,
  BrandConfig,
} from './types';

// ─── Brand Config ─────────────────────────────────────────────────────────────
export const BRANDS: BrandConfig[] = [
  { id: '1', name: 'AdSync', color: '#7c3aed' },
  { id: '2', name: 'Competitor A', color: '#2563eb' },
];

// ─── Platform Counts (right panel) ───────────────────────────────────────────
export const PLATFORM_COUNTS: PlatformCount[] = [
  { platform: 'twitter',   count: 960  },
  { platform: 'facebook',  count: 36   },
  { platform: 'instagram', count: 10   },
  { platform: 'tiktok',    count: 5    },
  { platform: 'youtube',   count: 59   },
  { platform: 'linkedin',  count: 3    },
  { platform: 'bluesky',   count: 10   },
  { platform: 'reddit',    count: 3    },
  { platform: 'forums',    count: 0    },
  { platform: 'news',      count: 0    },
  { platform: 'blogs',     count: 0    },
  { platform: 'web',       count: 14   },
];

// ─── Overall Stats ────────────────────────────────────────────────────────────
export const MENTION_STATS: MentionStats = {
  total_mentions:    960,
  total_reach:       10_100_000,
  total_interactions: 942,
  negative_count:    0,
  positive_count:    1,
  neutral_count:     959,
  positive_percentage: 100,
};

// ─── Volume & Reach Data ──────────────────────────────────────────────────────
export const VOLUME_DATA: VolumeDataPoint[] = [
  { date: '16 Dec', mentions: 2,   reach: 12_000    },
  { date: '18 Dec', mentions: 3,   reach: 18_000    },
  { date: '20 Dec', mentions: 5,   reach: 30_000    },
  { date: '22 Dec', mentions: 4,   reach: 25_000    },
  { date: '24 Dec', mentions: 7,   reach: 55_000    },
  { date: '26 Dec', mentions: 6,   reach: 48_000    },
  { date: '28 Dec', mentions: 9,   reach: 80_000    },
  { date: '30 Dec', mentions: 12,  reach: 110_000   },
  { date: '01 Jan', mentions: 28,  reach: 250_000   },
  { date: '03 Jan', mentions: 74,  reach: 470_110   },
  { date: '05 Jan', mentions: 131, reach: 1_224_866 },
  { date: '07 Jan', mentions: 88,  reach: 820_000   },
  { date: '09 Jan', mentions: 45,  reach: 390_000   },
  { date: '11 Jan', mentions: 22,  reach: 180_000   },
];

// ─── Sentiment Over Time ──────────────────────────────────────────────────────
export const SENTIMENT_DATA: SentimentDataPoint[] = [
  { date: '16 Dec', positive: 1, negative: 0, neutral: 1  },
  { date: '18 Dec', positive: 1, negative: 0, neutral: 2  },
  { date: '20 Dec', positive: 0, negative: 0, neutral: 5  },
  { date: '22 Dec', positive: 1, negative: 0, neutral: 3  },
  { date: '24 Dec', positive: 0, negative: 0, neutral: 7  },
  { date: '26 Dec', positive: 1, negative: 0, neutral: 5  },
  { date: '28 Dec', positive: 0, negative: 0, neutral: 9  },
  { date: '30 Dec', positive: 1, negative: 0, neutral: 11 },
  { date: '01 Jan', positive: 1, negative: 0, neutral: 27 },
  { date: '03 Jan', positive: 0, negative: 0, neutral: 74 },
  { date: '05 Jan', positive: 1, negative: 0, neutral: 130},
  { date: '07 Jan', positive: 0, negative: 0, neutral: 88 },
  { date: '09 Jan', positive: 0, negative: 0, neutral: 45 },
  { date: '11 Jan', positive: 0, negative: 0, neutral: 22 },
];

// ─── Social Media Interactions ────────────────────────────────────────────────
export const INTERACTIONS_DATA: InteractionDataPoint[] = [
  { date: '16 Dec', interactions: 4    },
  { date: '18 Dec', interactions: 8    },
  { date: '20 Dec', interactions: 14   },
  { date: '22 Dec', interactions: 10   },
  { date: '24 Dec', interactions: 20   },
  { date: '26 Dec', interactions: 18   },
  { date: '28 Dec', interactions: 35   },
  { date: '30 Dec', interactions: 55   },
  { date: '01 Jan', interactions: 90   },
  { date: '03 Jan', interactions: 140  },
  { date: '05 Jan', interactions: 148  },
  { date: '07 Jan', interactions: 120  },
  { date: '09 Jan', interactions: 60   },
  { date: '11 Jan', interactions: 18   },
];

// ─── Top Countries ────────────────────────────────────────────────────────────
export const TOP_COUNTRIES: TopCountry[] = [
  { country: 'Saudi Arabia', count: 466, flag: '🇸🇦' },
  { country: 'USA',          count: 10,  flag: '🇺🇸' },
  { country: 'Kenya',        count: 7,   flag: '🇰🇪' },
  { country: 'India',        count: 3,   flag: '🇮🇳' },
  { country: 'Pakistan',     count: 3,   flag: '🇵🇰' },
  { country: 'Egypt',        count: 2,   flag: '🇪🇬' },
  { country: 'Switzerland',  count: 1,   flag: '🇨🇭' },
  { country: 'New Zealand',  count: 1,   flag: '🇳🇿' },
];

// ─── Trending Conversations ───────────────────────────────────────────────────
export const TRENDING_CONVERSATIONS: TrendingConversation[] = [
  { phrase: 'customer support',     count: 279, sentiment: 'neutral'  },
  { phrase: 'account issues',       count: 267, sentiment: 'negative' },
  { phrase: 'transfer failed',      count: 219, sentiment: 'negative' },
  { phrase: 'new update',           count: 217, sentiment: 'neutral'  },
  { phrase: 'payment delay',        count: 173, sentiment: 'negative' },
  { phrase: 'app crash',            count: 169, sentiment: 'negative' },
  { phrase: 'excellent service',    count: 166, sentiment: 'positive' },
  { phrase: 'mobile wallet',        count: 147, sentiment: 'neutral'  },
  { phrase: 'transaction limit',    count: 140, sentiment: 'neutral'  },
  { phrase: 'great features',       count: 140, sentiment: 'positive' },
  { phrase: 'slow response',        count: 136, sentiment: 'negative' },
  { phrase: 'send money',           count: 136, sentiment: 'neutral'  },
  { phrase: 'blocked account',      count: 135, sentiment: 'negative' },
  { phrase: 'helpful team',         count: 118, sentiment: 'positive' },
  { phrase: 'money not received',   count: 116, sentiment: 'negative' },
  { phrase: 'verification needed',  count: 111, sentiment: 'neutral'  },
];

// ─── Trending Hashtags ────────────────────────────────────────────────────────
export const TRENDING_HASHTAGS: TrendingHashtag[] = [
  { hashtag: '#adsync',          count: 320, sentiment: 'neutral'  },
  { hashtag: '#fintech',         count: 210, sentiment: 'positive' },
  { hashtag: '#mobilepayments',  count: 175, sentiment: 'neutral'  },
  { hashtag: '#digitalwallet',   count: 130, sentiment: 'positive' },
  { hashtag: '#customerservice', count: 98,  sentiment: 'negative' },
  { hashtag: '#transfer',        count: 85,  sentiment: 'neutral'  },
  { hashtag: '#appupdate',       count: 72,  sentiment: 'neutral'  },
  { hashtag: '#techsupport',     count: 61,  sentiment: 'neutral'  },
];

// ─── Best Time to Post Heatmap ────────────────────────────────────────────────
export function generateHeatmapData(): HeatmapCell[] {
  const cells: HeatmapCell[] = [];
  const peaks: Record<number, number[]> = {
    0: [9, 10, 14, 15],       // Mon
    1: [8, 9, 13, 17],        // Tue
    2: [10, 11, 14, 16],      // Wed
    3: [9, 12, 15, 18],       // Thu
    4: [10, 13, 19, 20, 21],  // Fri – peak Fri 11 PM per BrandMentions
    5: [11, 14, 15, 20],      // Sat
    6: [12, 13, 14, 16],      // Sun
  };

  for (let day = 0; day < 7; day++) {
    for (let hour = 0; hour < 24; hour++) {
      const isPeak = peaks[day]?.includes(hour);
      const isNearPeak = peaks[day]?.some(p => Math.abs(p - hour) === 1);
      let value = Math.floor(Math.random() * 8);
      if (isPeak) value = 35 + Math.floor(Math.random() * 20);
      else if (isNearPeak) value = 18 + Math.floor(Math.random() * 15);
      cells.push({ day, hour, value });
    }
  }
  return cells;
}

// ─── Influencers ──────────────────────────────────────────────────────────────
export const INFLUENCERS: Influencer[] = [
  {
    id: '1',
    name: 'Customer Care Official',
    username: '@care_official',
    platform: 'twitter',
    followers: 1_005_124,
    mentions: 4,
    reach: 402_048,
    voice_share: 11.28,
    performance: 10,
    sentiment: 'neutral',
  },
  {
    id: '2',
    name: 'Financial Advisor SA',
    username: '@fin_advisor_sa',
    platform: 'twitter',
    followers: 878_657,
    mentions: 1,
    reach: 87_876,
    voice_share: 9.74,
    performance: 10,
    sentiment: 'neutral',
  },
  {
    id: '3',
    name: 'Tech Reviews Pro',
    username: '@techreviews_pro',
    platform: 'twitter',
    followers: 757_154,
    mentions: 1,
    reach: 75_715,
    voice_share: 8.4,
    performance: 10,
    sentiment: 'positive',
  },
  {
    id: '4',
    name: 'Arab Community Page',
    username: 'Arab Community',
    platform: 'facebook',
    followers: 476_936,
    mentions: 1,
    reach: 95_387,
    voice_share: 5.31,
    performance: 10,
    sentiment: 'neutral',
  },
  {
    id: '5',
    name: 'Digital Finance Hub',
    username: '@digitalfinance',
    platform: 'twitter',
    followers: 406_662,
    mentions: 1,
    reach: 40_666,
    voice_share: 4.53,
    performance: 10,
    sentiment: 'neutral',
  },
  {
    id: '6',
    name: 'AdSync Official',
    username: '@adsync',
    platform: 'twitter',
    followers: 353_951,
    mentions: 429,
    reach: 9_214_455,
    voice_share: 25.7,
    performance: 10,
    sentiment: 'neutral',
  },
  {
    id: '7',
    name: 'Daily Finance Digest',
    username: 'Daily Finance',
    platform: 'facebook',
    followers: 141_756,
    mentions: 1,
    reach: 3_600,
    voice_share: 1.61,
    performance: 10,
    sentiment: 'positive',
  },
  {
    id: '8',
    name: 'Mobile Pay Expert',
    username: '@mobilepayexp',
    platform: 'youtube',
    followers: 98_300,
    mentions: 3,
    reach: 28_000,
    voice_share: 2.1,
    performance: 9,
    sentiment: 'positive',
  },
];

// ─── Mentions Feed ────────────────────────────────────────────────────────────
export const MENTIONS: Mention[] = [
  {
    id: '1',
    platform: 'twitter',
    author: {
      name: 'Customer Care Official',
      username: '@care_official',
      followers: 1_005_124,
      verified: true,
    },
    content:
      'Hello! Thank you for contacting us. We are sorry for the inconvenience you faced. Your issue has been resolved and your account is now active. Please try again and let us know if you need further assistance. #adsync #customerservice',
    url: '#',
    created_at: '2026-01-12T19:27:00Z',
    sentiment: 'neutral',
    emotion: 'joy',
    reach: 100_512,
    interactions: 3,
    performance: 10,
    language: 'en',
    country: 'Saudi Arabia',
    hashtags: ['#adsync', '#customerservice'],
  },
  {
    id: '2',
    platform: 'twitter',
    author: {
      name: 'Sarah Mitchell',
      username: '@sarah_m',
      followers: 12_400,
    },
    content:
      'Just tried the new @adsync mobile app – transfers are instant now! Really impressed with the update 🔥 #fintech #digitalwallet',
    url: '#',
    created_at: '2026-01-11T14:10:00Z',
    sentiment: 'positive',
    emotion: 'joy',
    reach: 8_200,
    interactions: 45,
    performance: 9,
    language: 'en',
    country: 'USA',
    hashtags: ['#fintech', '#digitalwallet'],
  },
  {
    id: '3',
    platform: 'twitter',
    author: {
      name: 'Ahmed Al-Rashid',
      username: '@ahmed_rashid',
      followers: 34_800,
    },
    content:
      "Why is @adsync blocking transfers again? Third time this week. Customer support takes hours to respond. Very frustrating experience. #customerservice",
    url: '#',
    created_at: '2026-01-10T09:55:00Z',
    sentiment: 'negative',
    emotion: 'anger',
    reach: 22_100,
    interactions: 87,
    performance: 8,
    language: 'en',
    country: 'Saudi Arabia',
    hashtags: ['#customerservice'],
  },
  {
    id: '4',
    platform: 'facebook',
    author: {
      name: 'Arab Community Page',
      username: 'Arab Community',
      followers: 476_936,
    },
    content:
      'Important notice: AdSync has announced new limits on international transfers starting February 2026. Users should verify their accounts to avoid disruption.',
    url: '#',
    created_at: '2026-01-09T11:30:00Z',
    sentiment: 'neutral',
    reach: 95_387,
    interactions: 120,
    performance: 10,
    language: 'en',
    country: 'Saudi Arabia',
  },
  {
    id: '5',
    platform: 'youtube',
    author: {
      name: 'Mobile Pay Expert',
      username: '@mobilepayexp',
      followers: 98_300,
      verified: true,
    },
    content:
      'Full Review: AdSync 2026 Update — Is it worth it? I tested all the new features including the AI-powered budgeting tool and instant cross-border payments.',
    url: '#',
    created_at: '2026-01-08T16:00:00Z',
    sentiment: 'positive',
    emotion: 'joy',
    reach: 52_000,
    interactions: 340,
    performance: 9,
    language: 'en',
    country: 'USA',
  },
  {
    id: '6',
    platform: 'twitter',
    author: {
      name: 'FinTech News Daily',
      username: '@fintechnews',
      followers: 287_000,
      verified: true,
    },
    content:
      'Breaking: @adsync launches its new B2B payment gateway, targeting SMEs in the MENA region. The platform now supports 15 currencies and instant settlement.',
    url: '#',
    created_at: '2026-01-07T08:20:00Z',
    sentiment: 'positive',
    emotion: 'surprise',
    reach: 180_000,
    interactions: 520,
    performance: 10,
    language: 'en',
    country: 'USA',
    hashtags: ['#fintech', '#MENA'],
  },
  {
    id: '7',
    platform: 'reddit',
    author: {
      name: 'u/digital_finance_guy',
      username: 'u/digital_finance_guy',
      followers: 1_200,
    },
    content:
      "Has anyone else noticed AdSync's fees went up? Just got charged 2.5% on a transfer that used to be free. Not happy about this silent change.",
    url: '#',
    created_at: '2026-01-06T21:45:00Z',
    sentiment: 'negative',
    emotion: 'anger',
    reach: 3_400,
    interactions: 67,
    performance: 7,
    language: 'en',
    country: 'USA',
  },
  {
    id: '8',
    platform: 'instagram',
    author: {
      name: 'Layla Hassan',
      username: '@layla.h',
      followers: 45_200,
    },
    content:
      'Love how easy it is to split bills with @adsync! Perfect for travel with friends 🌍✈️ #digitalwallet #mobilepayments',
    url: '#',
    created_at: '2026-01-05T13:15:00Z',
    sentiment: 'positive',
    emotion: 'love',
    reach: 18_000,
    interactions: 234,
    performance: 8,
    language: 'en',
    country: 'Egypt',
    hashtags: ['#digitalwallet', '#mobilepayments'],
  },
  {
    id: '9',
    platform: 'linkedin',
    author: {
      name: 'James Carter',
      username: 'James Carter',
      followers: 8_900,
      verified: false,
    },
    content:
      "Attended the AdSync partner summit yesterday. Their roadmap for 2026 looks impressive — open banking APIs, crypto integration, and enterprise treasury management. Exciting times ahead for fintech!",
    url: '#',
    created_at: '2026-01-04T10:00:00Z',
    sentiment: 'positive',
    emotion: 'joy',
    reach: 5_600,
    interactions: 89,
    performance: 8,
    language: 'en',
    country: 'Switzerland',
  },
  {
    id: '10',
    platform: 'twitter',
    author: {
      name: 'TechCrunch ME',
      username: '@techcrunchme',
      followers: 156_000,
      verified: true,
    },
    content:
      'AdSync hits 5 million users in MENA region, plans regional HQ in Riyadh by Q3 2026. CEO confirms $50M Series B close. @adsync',
    url: '#',
    created_at: '2026-01-03T07:00:00Z',
    sentiment: 'positive',
    emotion: 'surprise',
    reach: 98_000,
    interactions: 670,
    performance: 10,
    language: 'en',
    country: 'Saudi Arabia',
  },
  {
    id: '11',
    platform: 'bluesky',
    author: {
      name: 'OpenFinance Dev',
      username: '@openfinance.bsky',
      followers: 3_200,
    },
    content:
      'AdSync just released their public API docs. Looks clean and well designed. Looking forward to building some integrations. #openbanking',
    url: '#',
    created_at: '2026-01-02T15:30:00Z',
    sentiment: 'positive',
    emotion: 'joy',
    reach: 1_800,
    interactions: 22,
    performance: 7,
    language: 'en',
    country: 'New Zealand',
    hashtags: ['#openbanking'],
  },
  {
    id: '12',
    platform: 'twitter',
    author: {
      name: 'Kareem Nasser',
      username: '@kareemnasser',
      followers: 5_600,
    },
    content:
      'My salary transfer via AdSync was delayed by 3 days. No explanation from their side. Not acceptable for a financial platform. #customerservice',
    url: '#',
    created_at: '2025-12-31T18:00:00Z',
    sentiment: 'negative',
    emotion: 'anger',
    reach: 3_100,
    interactions: 34,
    performance: 6,
    language: 'en',
    country: 'Kenya',
    hashtags: ['#customerservice'],
  },
  {
    id: '13',
    platform: 'tiktok',
    author: {
      name: 'Mona Finance Tips',
      username: '@mona.finance',
      followers: 210_000,
    },
    content:
      'Top 3 fintech apps I use every day in 2026! AdSync makes international transfers SO easy! 💸 #fintech #moneytips',
    url: '#',
    created_at: '2025-12-29T20:00:00Z',
    sentiment: 'positive',
    emotion: 'joy',
    reach: 85_000,
    interactions: 1_200,
    performance: 9,
    language: 'en',
    country: 'Saudi Arabia',
    hashtags: ['#fintech', '#moneytips'],
  },
  {
    id: '14',
    platform: 'web',
    author: {
      name: 'Gulf Tech Review',
      username: 'Gulf Tech Review',
      followers: 22_000,
    },
    content:
      "AdSync's 2025 Annual Report: 340% growth in transaction volume, expansion to 12 new markets, and introduction of AI-driven fraud detection.",
    url: '#',
    created_at: '2025-12-25T09:00:00Z',
    sentiment: 'positive',
    emotion: 'surprise',
    reach: 18_000,
    interactions: 95,
    performance: 8,
    language: 'en',
    country: 'Saudi Arabia',
  },
  {
    id: '15',
    platform: 'twitter',
    author: {
      name: 'Priya Sharma',
      username: '@priya_s',
      followers: 9_800,
    },
    content:
      'Been using @adsync for 6 months now. Zero issues, great customer support when I needed help, and the app UI keeps getting better. Highly recommend! 👍',
    url: '#',
    created_at: '2025-12-22T11:00:00Z',
    sentiment: 'positive',
    emotion: 'love',
    reach: 5_900,
    interactions: 41,
    performance: 8,
    language: 'en',
    country: 'India',
  },
];

// ─── AI Digest Content ────────────────────────────────────────────────────────
export const AI_DIGEST = {
  title: 'Content Creators Miss Accuracy, Transfers Fail',
  period: '12 Dec 2025 – 12 Jan 2026',
  summary: `The period started calmly, then escalated sharply toward year-end. A spike occurred on **January 5, 2026** driven by TikTok videos explaining the app's new international transfer tiers and mandatory account verification for wallet holders. This, combined with a promotional push by AdSync's official account offering cashback rewards, attracted significant attention — both positive and critical.

The community was engaged across YouTube and Twitter, with content creators providing tutorials on the new features. However, this also surfaced latent frustrations around transfer delays and customer support response times.`,
  bullet_points: [
    'Volume: **1,087 mentions** recorded across all platforms.',
    'Engagement peaked at **16,787** potential reach of **21.0M**.',
    'Over 90% of engagement came from YouTube and Twitter, while TikTok lagged behind X(Twitter) in volume.',
  ],
  key_themes: [
    { theme: 'Transfer Issues', count: 312, sentiment: 'negative' as const },
    { theme: 'New Features Launch', count: 287, sentiment: 'positive' as const },
    { theme: 'Customer Support', count: 245, sentiment: 'neutral' as const },
    { theme: 'App Performance', count: 143, sentiment: 'neutral' as const },
  ],
};
