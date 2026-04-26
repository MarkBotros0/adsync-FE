import { Heart, MessageCircle, Eye, Share2, BadgeCheck, Music } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import { formatNumber } from '@/lib/utils';
import type { CompetitorActorResult, TikTokData } from '@/lib/types';

interface TikTokTabProps {
  result: CompetitorActorResult<TikTokData>;
  onRetry?: () => Promise<void> | void;
}

export function TikTokTab({ result, onRetry }: TikTokTabProps) {
  if (result.status !== 'completed') {
    return (
      <ActorTabSkeleton
        status={result.status}
        actorLabel={COMPETITOR_ACTOR_LABELS.tiktok}
        description={COMPETITOR_ACTOR_DESCRIPTIONS.tiktok}
        error={result.error}
        onRetry={onRetry}
      />
    );
  }

  const data = result.data;
  const authors = data?.authors ?? [];
  const videos = data?.videos ?? [];

  if (authors.length === 0 && videos.length === 0) {
    return (
      <EmptyTab
        title="No TikTok results"
        description="No matching TikTok creators or videos were found for this brand name."
      />
    );
  }

  const top = authors[0];

  return (
    <div className="space-y-6">
      {top && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-dk-border dark:bg-dk-surface">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {top.avatar ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={top.avatar}
                alt={top.username}
                className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-dk-border"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 dark:bg-dk-raised" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a
                  href={`https://tiktok.com/@${top.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-slate-900 hover:underline dark:text-white"
                >
                  @{top.username}
                </a>
                {top.verified && <BadgeCheck className="h-4 w-4 text-blue-500" />}
              </div>
              {top.nickname && (
                <div className="text-sm text-slate-600 dark:text-slate-300">{top.nickname}</div>
              )}
              {top.signature && (
                <p className="mt-2 line-clamp-2 text-sm text-slate-500 dark:text-slate-400">
                  {top.signature}
                </p>
              )}
            </div>
            <dl className="grid w-full grid-cols-3 gap-3 text-center sm:w-auto">
              <Stat label="Followers" value={top.followers} />
              <Stat label="Hearts" value={top.hearts} />
              <Stat label="Videos" value={top.video_count} />
            </dl>
          </div>
        </section>
      )}

      {videos.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent videos
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {videos.map((video) => (
              <a
                key={video.id ?? video.url}
                href={video.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dk-border dark:bg-dk-surface"
              >
                <div className="relative aspect-[9/16] w-full overflow-hidden bg-slate-100 dark:bg-dk-raised">
                  {video.cover ? (
                    // eslint-disable-next-line @next/next/no-img-element
                    <img
                      src={video.cover}
                      alt={video.description ?? 'TikTok video'}
                      className="h-full w-full object-cover transition-transform group-hover:scale-105"
                      loading="lazy"
                    />
                  ) : (
                    <div className="grid h-full w-full place-items-center text-xs text-slate-400">
                      No preview
                    </div>
                  )}
                  <span className="absolute right-2 top-2 rounded-md bg-black/60 px-1.5 py-0.5 text-xs font-medium text-white">
                    <Eye className="mr-1 inline h-3 w-3" />
                    {formatNumber(video.plays)}
                  </span>
                </div>
                <div className="p-3">
                  {video.description && (
                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                      {video.description}
                    </p>
                  )}
                  {video.music_name && (
                    <div className="mt-1 flex items-center gap-1 text-xs text-slate-500 dark:text-slate-400">
                      <Music className="h-3 w-3" />
                      <span className="truncate">{video.music_name}</span>
                    </div>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {formatNumber(video.likes)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {formatNumber(video.comments)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <Share2 className="h-3 w-3" /> {formatNumber(video.shares)}
                    </span>
                  </div>
                </div>
              </a>
            ))}
          </div>
        </section>
      )}
    </div>
  );
}

function Stat({ label, value }: { label: string; value: number }) {
  return (
    <div>
      <div className="text-lg font-bold tabular-nums text-slate-900 dark:text-white">
        {formatNumber(value)}
      </div>
      <div className="text-xs text-slate-500 dark:text-slate-400">{label}</div>
    </div>
  );
}
