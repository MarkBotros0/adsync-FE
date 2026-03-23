import { pagesAPI, instagramAPI, tiktokAPI } from '@/lib/api';
import type { Mention, IGMedia, Post, TikTokVideo, FacebookPage } from '@/lib/types';

export function postsToMentions(posts: Post[], pageName: string): Mention[] {
  return posts
    .filter(post => post.message || post.story)
    .map(post => {
      const message = post.message || '';
      const hashtags = message.match(/#\w+/g) ?? [];
      const total = post.engagement?.total ?? 0;
      return {
        id: post.id,
        platform: 'facebook' as const,
        author: {
          name: pageName,
          username: `@${pageName.toLowerCase().replace(/\s+/g, '')}`,
          followers: 0,
        },
        content: message || post.story || '',
        url: post.permalink_url || '#',
        created_at: post.created_time,
        sentiment: 'neutral' as const,
        reach: (post.engagement?.reactions ?? 0) * 10,
        interactions: total,
        performance: Math.min(10, Math.max(1, Math.ceil(total / 5))),
        language: 'en',
        hashtags: hashtags.length > 0 ? hashtags : undefined,
      };
    });
}

export function igMediaToMentions(items: IGMedia[], username: string): Mention[] {
  return items
    .filter(item => item.media_product_type !== 'STORY')
    .map(item => {
      const hashtags = (item.caption || '').match(/#\w+/g) ?? [];
      const interactions = (item.engagement?.likes ?? 0) + (item.engagement?.comments ?? 0);
      const views = item.engagement?.views ?? 0;
      return {
        id: item.id,
        platform: 'instagram' as const,
        author: {
          name: item.username || username,
          username: `@${item.username || username}`,
          followers: 0,
        },
        content: item.caption || '',
        url: item.permalink || '#',
        created_at: item.timestamp,
        sentiment: 'neutral' as const,
        reach: item.media_product_type === 'REELS' ? views : (item.engagement?.likes ?? 0) * 10,
        interactions,
        performance: Math.min(10, Math.max(1, Math.ceil(interactions / 5))),
        language: 'en',
        hashtags: hashtags.length > 0 ? hashtags : undefined,
      };
    });
}

export function tiktokVideosToMentions(videos: TikTokVideo[], displayName: string): Mention[] {
  return videos.map(video => {
    const interactions =
      (video.engagement?.likes ?? 0) +
      (video.engagement?.comments ?? 0) +
      (video.engagement?.shares ?? 0);
    const hashtags = (video.title || video.description || '').match(/#\w+/g) ?? [];
    return {
      id: video.id,
      platform: 'tiktok' as const,
      author: {
        name: displayName,
        username: `@${displayName}`,
        followers: 0,
      },
      content: video.description || video.title || '',
      url: video.share_url || '#',
      created_at: new Date(video.created_at * 1000).toISOString(),
      sentiment: 'neutral' as const,
      reach: video.engagement?.views ?? 0,
      interactions,
      performance: Math.min(10, Math.max(1, Math.ceil(interactions / 5))),
      language: 'en',
      hashtags: hashtags.length > 0 ? hashtags : undefined,
      image_url: video.cover_image_url || undefined,
    };
  });
}

interface FetchMentionsParams {
  sessionId: string | null;
  selectedPage: FacebookPage | null;
  igSessionId: string | null;
  igUserId: string | null;
  ttSessionId: string | null;
  ttOpenId: string | null;
}

export async function fetchAllMentions({
  sessionId,
  selectedPage,
  igSessionId,
  igUserId,
  ttSessionId,
  ttOpenId,
}: FetchMentionsParams): Promise<Mention[]> {
  const results: Mention[] = [];

  if (sessionId && selectedPage) {
    try {
      const res = await pagesAPI.getPagePosts(selectedPage.id, sessionId, 50, selectedPage.access_token);
      results.push(...postsToMentions(res.data.posts ?? [], selectedPage.name));
    } catch {}
  }

  if (igSessionId && igUserId) {
    try {
      const res = await instagramAPI.getMedia(igUserId, igSessionId, { limit: 50 });
      const items = res.data.data?.media ?? [];
      const username = items[0]?.username ?? igUserId;
      results.push(...igMediaToMentions(items, username));
    } catch {}
  }

  if (ttSessionId) {
    try {
      const res = await tiktokAPI.getVideos(ttSessionId, { max_count: 20 });
      const videos = res.data.data?.videos ?? [];
      const displayName = res.data.data?.display_name ?? ttOpenId ?? 'TikTok';
      results.push(...tiktokVideosToMentions(videos, displayName));
    } catch {}
  }

  return results;
}
