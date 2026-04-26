import { Heart, MessageCircle, Eye, BadgeCheck, ExternalLink } from 'lucide-react';
import { ActorTabSkeleton } from '@/components/competitor/ActorTabSkeleton';
import { EmptyTab } from '@/components/competitor/EmptyTab';
import {
  COMPETITOR_ACTOR_DESCRIPTIONS,
  COMPETITOR_ACTOR_LABELS,
} from '@/lib/constants';
import { formatNumber, proxyImage } from '@/lib/utils';
import type { CompetitorActorResult, InstagramData } from '@/lib/types';

interface InstagramTabProps {
  result: CompetitorActorResult<InstagramData>;
  onRetry?: () => Promise<void> | void;
}

export function InstagramTab({ result, onRetry }: InstagramTabProps) {
  if (result.status !== 'completed') {
    return (
      <ActorTabSkeleton
        status={result.status}
        actorLabel={COMPETITOR_ACTOR_LABELS.instagram}
        description={COMPETITOR_ACTOR_DESCRIPTIONS.instagram}
        error={result.error}
        onRetry={onRetry}
      />
    );
  }

  const data = result.data;
  const profiles = data?.profiles ?? [];
  const posts = data?.posts ?? [];

  if (profiles.length === 0 && posts.length === 0) {
    return (
      <EmptyTab
        title="No Instagram results"
        description="No matching Instagram profiles were found for this brand name."
      />
    );
  }

  const top = profiles[0];

  return (
    <div className="space-y-6">
      {top && (
        <section className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm sm:p-5 dark:border-dk-border dark:bg-dk-surface">
          <div className="flex flex-col gap-4 sm:flex-row sm:items-center">
            {top.profile_pic_url ? (
              // eslint-disable-next-line @next/next/no-img-element
              <img
                src={proxyImage(top.profile_pic_url)}
                alt={top.username ?? 'Profile'}
                className="h-16 w-16 rounded-full border border-slate-200 object-cover dark:border-dk-border"
              />
            ) : (
              <div className="grid h-16 w-16 place-items-center rounded-full bg-slate-100 dark:bg-dk-raised" />
            )}
            <div className="flex-1 min-w-0">
              <div className="flex items-center gap-2">
                <a
                  href={`https://instagram.com/${top.username}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-base font-semibold text-slate-900 hover:underline dark:text-white"
                >
                  @{top.username}
                </a>
                {top.is_verified && (
                  <BadgeCheck className="h-4 w-4 text-blue-500" aria-label="Verified" />
                )}
              </div>
              {top.full_name && (
                <div className="text-sm text-slate-600 dark:text-slate-300">{top.full_name}</div>
              )}
              {top.biography && (
                <p className="mt-2 line-clamp-3 text-sm text-slate-500 dark:text-slate-400">
                  {top.biography}
                </p>
              )}
              {top.external_url && (
                <a
                  href={top.external_url}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-2 inline-flex items-center gap-1 text-xs font-semibold text-blue-600 hover:underline dark:text-blue-400"
                >
                  {top.external_url} <ExternalLink className="h-3 w-3" />
                </a>
              )}
            </div>
            <dl className="grid w-full grid-cols-3 gap-3 text-center sm:w-auto">
              <Stat label="Followers" value={top.followers} />
              <Stat label="Following" value={top.follows} />
              <Stat label="Posts" value={top.posts_count} />
            </dl>
          </div>
        </section>
      )}

      {posts.length > 0 && (
        <section>
          <h3 className="mb-3 text-sm font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
            Recent posts
          </h3>
          <div className="grid grid-cols-2 gap-3 lg:grid-cols-3">
            {posts.map((post) => (
              <a
                key={post.id ?? post.url}
                href={post.url ?? '#'}
                target="_blank"
                rel="noopener noreferrer"
                className="group overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm transition-shadow hover:shadow-md dark:border-dk-border dark:bg-dk-surface"
              >
                {post.display_url ? (
                  // eslint-disable-next-line @next/next/no-img-element
                  <img
                    src={proxyImage(post.display_url)}
                    alt={post.caption ?? 'Instagram post'}
                    className="aspect-square w-full object-cover transition-transform group-hover:scale-105"
                    loading="lazy"
                  />
                ) : (
                  <div className="grid aspect-square w-full place-items-center bg-slate-100 text-xs text-slate-400 dark:bg-dk-raised">
                    No preview
                  </div>
                )}
                <div className="p-3">
                  {post.caption && (
                    <p className="line-clamp-2 text-xs text-slate-600 dark:text-slate-300">
                      {post.caption}
                    </p>
                  )}
                  <div className="mt-2 flex items-center gap-3 text-xs text-slate-500 dark:text-slate-400">
                    <span className="inline-flex items-center gap-1">
                      <Heart className="h-3 w-3" /> {formatNumber(post.likes)}
                    </span>
                    <span className="inline-flex items-center gap-1">
                      <MessageCircle className="h-3 w-3" /> {formatNumber(post.comments)}
                    </span>
                    {post.video_views > 0 && (
                      <span className="inline-flex items-center gap-1">
                        <Eye className="h-3 w-3" /> {formatNumber(post.video_views)}
                      </span>
                    )}
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
