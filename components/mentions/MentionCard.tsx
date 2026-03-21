'use client';

import { ExternalLink, Trash2, Eye } from 'lucide-react';
import type { Mention, MentionPlatform, Sentiment } from '@/lib/types';
import { formatDistanceToNow } from 'date-fns';

// ─── Platform helpers ─────────────────────────────────────────────────────────

const PLATFORM_BG: Record<MentionPlatform, string> = {
  twitter:   'bg-black',
  facebook:  'bg-blue-600',
  instagram: 'bg-pink-500',
  tiktok:    'bg-gray-900',
  youtube:   'bg-red-500',
  linkedin:  'bg-blue-700',
  bluesky:   'bg-sky-500',
  reddit:    'bg-orange-500',
  forums:    'bg-slate-500',
  news:      'bg-slate-700',
  blogs:     'bg-indigo-500',
  web:       'bg-teal-500',
};

function PlatformBadgeIcon({ platform }: { platform: MentionPlatform }) {
  const cls = 'h-2.5 w-2.5 fill-white';
  switch (platform) {
    case 'twitter': return (
      <svg className={cls} viewBox="0 0 24 24"><path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-4.714-6.231-5.401 6.231H2.746l7.73-8.835L1.254 2.25H8.08l4.26 5.632zm-1.161 17.52h1.833L7.084 4.126H5.117z"/></svg>
    );
    case 'facebook': return (
      <svg className={cls} viewBox="0 0 24 24"><path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/></svg>
    );
    case 'instagram': return (
      <svg className={cls} viewBox="0 0 24 24"><path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zm0-2.163c-3.259 0-3.667.014-4.947.072-4.358.2-6.78 2.618-6.98 6.98-.059 1.281-.073 1.689-.073 4.948 0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98 1.281.058 1.689.072 4.948.072 3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98-1.281-.059-1.69-.073-4.949-.073zm0 5.838c-3.403 0-6.162 2.759-6.162 6.162s2.759 6.163 6.162 6.163 6.162-2.759 6.162-6.163c0-3.403-2.759-6.162-6.162-6.162zm0 10.162c-2.209 0-4-1.79-4-4 0-2.209 1.791-4 4-4s4 1.791 4 4c0 2.21-1.791 4-4 4zm6.406-11.845c-.796 0-1.441.645-1.441 1.44s.645 1.44 1.441 1.44c.795 0 1.439-.645 1.439-1.44s-.644-1.44-1.439-1.44z"/></svg>
    );
    case 'tiktok': return (
      <svg className={cls} viewBox="0 0 24 24"><path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.33 6.33 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.82a8.17 8.17 0 004.77 1.52V6.89a4.85 4.85 0 01-1-.2z"/></svg>
    );
    case 'youtube': return (
      <svg className={cls} viewBox="0 0 24 24"><path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/></svg>
    );
    case 'linkedin': return (
      <svg className={cls} viewBox="0 0 24 24"><path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z"/></svg>
    );
    default: return null;
  }
}

const SENTIMENT_META: Record<Sentiment, { label: string; cls: string }> = {
  positive: { label: 'Positive', cls: 'bg-green-50 text-green-600 border-green-200' },
  negative: { label: 'Negative', cls: 'bg-red-50 text-red-600 border-red-200'       },
  neutral:  { label: 'Neutral',  cls: 'bg-slate-100 text-slate-500 border-slate-200' },
};

function formatFollowers(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(0) + 'K';
  return n.toString();
}

function getInitials(name: string): string {
  return name
    .split(/\s+/)
    .slice(0, 2)
    .map(w => w[0])
    .join('')
    .toUpperCase();
}

interface MentionCardProps {
  mention: Mention;
  onDelete?: (id: string) => void;
}

export function MentionCard({ mention, onDelete }: MentionCardProps) {
  const platBg = PLATFORM_BG[mention.platform];
  const sentMeta = SENTIMENT_META[mention.sentiment];

  const timeAgo = formatDistanceToNow(new Date(mention.created_at), { addSuffix: true });

  return (
    <div className="border-b border-slate-100 bg-white hover:bg-slate-50/60 transition-colors px-5 py-4">
      <div className="flex items-start gap-3">
        {/* Avatar */}
        <div className="relative shrink-0">
          <div className="h-10 w-10 rounded-full bg-gradient-to-br from-slate-200 to-slate-300 flex items-center justify-center text-sm font-semibold text-slate-600">
            {getInitials(mention.author.name)}
          </div>
          <div className={`absolute -bottom-0.5 -right-0.5 h-4 w-4 rounded-full flex items-center justify-center ${platBg}`}>
            <PlatformBadgeIcon platform={mention.platform} />
          </div>
        </div>

        {/* Content */}
        <div className="flex-1 min-w-0">
          {/* Author row */}
          <div className="flex items-center gap-2 flex-wrap mb-1">
            <span className="text-sm font-semibold text-slate-900 truncate">{mention.author.name}</span>
            {mention.author.verified && (
              <span className="text-blue-500 text-xs">✓</span>
            )}
            <span className="text-xs text-slate-400">
              {formatFollowers(mention.author.followers)} followers
            </span>
            <span className="text-xs text-slate-400 ml-auto">{timeAgo}</span>
          </div>

          {/* Text */}
          <p className="text-sm text-slate-700 leading-relaxed line-clamp-3 mb-2">
            {mention.content}
          </p>

          {/* Hashtags */}
          {mention.hashtags && mention.hashtags.length > 0 && (
            <div className="flex flex-wrap gap-1 mb-2">
              {mention.hashtags.map(tag => (
                <span key={tag} className="text-xs text-purple-600 hover:underline cursor-pointer">
                  {tag}
                </span>
              ))}
            </div>
          )}

          {/* Footer */}
          <div className="flex items-center gap-3 flex-wrap">
            {/* Performance dots */}
            <div className="flex items-center gap-0.5">
              {Array.from({ length: 10 }).map((_, i) => (
                <div
                  key={i}
                  className={`h-1.5 w-1.5 rounded-full ${
                    i < mention.performance ? 'bg-purple-500' : 'bg-slate-200'
                  }`}
                />
              ))}
            </div>

            {/* Reach */}
            <span className="text-xs text-slate-500 flex items-center gap-1">
              <Eye className="h-3 w-3" />
              {formatFollowers(mention.reach)}
            </span>

            {/* Interactions */}
            <span className="text-xs text-slate-500">
              {mention.interactions} interactions
            </span>

            {/* Sentiment badge */}
            <span className={`text-[11px] font-medium px-2 py-0.5 rounded-full border ${sentMeta.cls}`}>
              {sentMeta.label}
            </span>

            {/* Actions */}
            <div className="ml-auto flex items-center gap-2">
              <a
                href={mention.url}
                target="_blank"
                rel="noopener noreferrer"
                className="flex items-center gap-1 text-xs text-slate-400 hover:text-purple-600 transition-colors"
              >
                <ExternalLink className="h-3.5 w-3.5" />
                Visit
              </a>
              {onDelete && (
                <button
                  onClick={() => onDelete(mention.id)}
                  className="text-slate-300 hover:text-red-500 transition-colors"
                >
                  <Trash2 className="h-3.5 w-3.5" />
                </button>
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
