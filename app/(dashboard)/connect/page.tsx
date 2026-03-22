'use client';

import { useState, useEffect, useRef } from 'react';
import { useSearchParams } from 'next/navigation';
import { authAPI, facebookSessionAPI, instagramSessionAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { Loader2, CheckCircle2, Circle, ExternalLink, Unplug } from 'lucide-react';
import { toast } from 'sonner';
import { cn } from '@/lib/utils';

// ─── Platform definitions ─────────────────────────────────────────────────────

interface PlatformDef {
  id: string;
  name: string;
  description: string;
  color: string;
  bg: string;
  ring: string;
  icon: React.ReactNode;
  available: boolean;
}

function FacebookIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z" />
    </svg>
  );
}
function InstagramIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M12 2.163c3.204 0 3.584.012 4.85.07 3.252.148 4.771 1.691 4.919 4.919.058 1.265.069 1.645.069 4.849 0 3.205-.012 3.584-.069 4.849-.149 3.225-1.664 4.771-4.919 4.919-1.266.058-1.644.07-4.85.07-3.204 0-3.584-.012-4.849-.07-3.26-.149-4.771-1.699-4.919-4.92-.058-1.265-.07-1.644-.07-4.849 0-3.204.013-3.583.07-4.849.149-3.227 1.664-4.771 4.919-4.919 1.266-.057 1.645-.069 4.849-.069zM12 0C8.741 0 8.333.014 7.053.072 2.695.272.273 2.69.073 7.052.014 8.333 0 8.741 0 12c0 3.259.014 3.668.072 4.948.2 4.358 2.618 6.78 6.98 6.98C8.333 23.986 8.741 24 12 24c3.259 0 3.668-.014 4.948-.072 4.354-.2 6.782-2.618 6.979-6.98.059-1.28.073-1.689.073-4.948 0-3.259-.014-3.667-.072-4.947-.196-4.354-2.617-6.78-6.979-6.98C15.668.014 15.259 0 12 0zm0 5.838a6.162 6.162 0 100 12.324 6.162 6.162 0 000-12.324zM12 16a4 4 0 110-8 4 4 0 010 8zm6.406-11.845a1.44 1.44 0 100 2.881 1.44 1.44 0 000-2.881z" />
    </svg>
  );
}
function TikTokIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M19.59 6.69a4.83 4.83 0 01-3.77-4.25V2h-3.45v13.67a2.89 2.89 0 01-2.88 2.5 2.89 2.89 0 01-2.89-2.89 2.89 2.89 0 012.89-2.89c.28 0 .54.04.79.1V9.01a6.27 6.27 0 00-.79-.05 6.34 6.34 0 00-6.34 6.34 6.34 6.34 0 006.34 6.34 6.34 6.34 0 006.33-6.34V8.69a8.18 8.18 0 004.79 1.54V6.78a4.85 4.85 0 01-1.02-.09z" />
    </svg>
  );
}
function LinkedInIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433a2.062 2.062 0 01-2.063-2.065 2.064 2.064 0 112.063 2.065zm1.782 13.019H3.555V9h3.564v11.452zM22.225 0H1.771C.792 0 0 .774 0 1.729v20.542C0 23.227.792 24 1.771 24h20.451C23.2 24 24 23.227 24 22.271V1.729C24 .774 23.2 0 22.222 0h.003z" />
    </svg>
  );
}
function TwitterIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z" />
    </svg>
  );
}
function YouTubeIcon({ className }: { className?: string }) {
  return (
    <svg className={className} viewBox="0 0 24 24" fill="currentColor">
      <path d="M23.498 6.186a3.016 3.016 0 00-2.122-2.136C19.505 3.545 12 3.545 12 3.545s-7.505 0-9.377.505A3.017 3.017 0 00.502 6.186C0 8.07 0 12 0 12s0 3.93.502 5.814a3.016 3.016 0 002.122 2.136c1.871.505 9.376.505 9.376.505s7.505 0 9.377-.505a3.015 3.015 0 002.122-2.136C24 15.93 24 12 24 12s0-3.93-.502-5.814zM9.545 15.568V8.432L15.818 12l-6.273 3.568z" />
    </svg>
  );
}

const PLATFORMS: PlatformDef[] = [
  {
    id: 'facebook',
    name: 'Facebook',
    description: 'Pages, posts, ad insights & engagement metrics',
    color: 'text-blue-400',
    bg: 'bg-blue-500/10',
    ring: 'ring-blue-500/40',
    icon: <FacebookIcon className="h-7 w-7" />,
    available: true,
  },
  {
    id: 'instagram',
    name: 'Instagram',
    description: 'Reels, stories, follower growth & reach',
    color: 'text-pink-400',
    bg: 'bg-pink-500/10',
    ring: 'ring-pink-500/40',
    icon: <InstagramIcon className="h-7 w-7" />,
    available: true,
  },
  {
    id: 'tiktok',
    name: 'TikTok',
    description: 'Video performance, trends & audience insights',
    color: 'text-cyan-400',
    bg: 'bg-cyan-500/10',
    ring: 'ring-cyan-500/40',
    icon: <TikTokIcon className="h-7 w-7" />,
    available: false,
  },
  {
    id: 'linkedin',
    name: 'LinkedIn',
    description: 'Company page analytics & post performance',
    color: 'text-sky-400',
    bg: 'bg-sky-500/10',
    ring: 'ring-sky-500/40',
    icon: <LinkedInIcon className="h-7 w-7" />,
    available: false,
  },
  {
    id: 'twitter',
    name: 'X (Twitter)',
    description: 'Tweet impressions, mentions & follower trends',
    color: 'text-slate-300',
    bg: 'bg-slate-500/10',
    ring: 'ring-slate-500/40',
    icon: <TwitterIcon className="h-7 w-7" />,
    available: false,
  },
  {
    id: 'youtube',
    name: 'YouTube',
    description: 'Channel analytics, views & subscriber growth',
    color: 'text-red-400',
    bg: 'bg-red-500/10',
    ring: 'ring-red-500/40',
    icon: <YouTubeIcon className="h-7 w-7" />,
    available: false,
  },
];

// ─── Platform card ────────────────────────────────────────────────────────────

interface ConnectionStatus {
  connected: boolean;
  user_name?: string | null;
  loading: boolean;
}

function PlatformCard({
  platform,
  status,
  onConnect,
  onDisconnect,
}: {
  platform: PlatformDef;
  status: ConnectionStatus;
  onConnect: () => void;
  onDisconnect: () => void;
}) {
  return (
    <div
      className={cn(
        'relative flex flex-col gap-5 rounded-2xl border p-6 transition-all duration-200',
        status.connected
          ? `bg-slate-50 dark:bg-white/[0.06] border-slate-200 dark:border-white/15 ring-1 ${platform.ring}`
          : 'bg-white dark:bg-white/[0.03] border-slate-200 dark:border-white/[0.08] hover:bg-slate-50 dark:hover:bg-white/[0.05] hover:border-slate-300 dark:hover:border-white/[0.12]',
      )}
    >
      {/* Header */}
      <div className="flex items-start gap-4">
        <div className={cn('h-14 w-14 rounded-2xl flex items-center justify-center shrink-0', platform.bg, platform.color)}>
          {platform.icon}
        </div>
        <div className="flex-1 min-w-0">
          <div className="flex items-center gap-2 flex-wrap">
            <h3 className="text-base font-bold text-slate-900 dark:text-white">{platform.name}</h3>
            {!platform.available && (
              <span className="text-[10px] font-bold uppercase tracking-wide bg-slate-100 dark:bg-white/10 text-slate-400 dark:text-white/40 px-2 py-0.5 rounded-full">
                Coming soon
              </span>
            )}
          </div>
          <p className="text-xs text-slate-500 dark:text-white/40 mt-0.5 leading-relaxed">{platform.description}</p>
        </div>
      </div>

      {/* Status + action */}
      <div className="flex items-center justify-between gap-3">
        {status.loading ? (
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/40 text-xs">
            <Loader2 className="h-3.5 w-3.5 animate-spin" />
            Checking…
          </div>
        ) : status.connected ? (
          <div className="flex items-center gap-2 flex-1 min-w-0">
            <CheckCircle2 className="h-4 w-4 text-emerald-500 dark:text-emerald-400 shrink-0" />
            <span className="text-xs text-emerald-600 dark:text-emerald-300 font-medium truncate">
              {status.user_name ?? 'Connected'}
            </span>
          </div>
        ) : (
          <div className="flex items-center gap-2 text-slate-400 dark:text-white/30 text-xs">
            <Circle className="h-3.5 w-3.5 shrink-0" />
            Not connected
          </div>
        )}

        {platform.available && (
          status.connected ? (
            <button
              onClick={onDisconnect}
              className="inline-flex items-center gap-1.5 text-xs font-medium text-red-400/80 hover:text-red-300 bg-red-500/10 hover:bg-red-500/20 border border-red-500/20 px-3 py-1.5 rounded-lg transition-all shrink-0"
            >
              <Unplug className="h-3.5 w-3.5" />
              Disconnect
            </button>
          ) : (
            <button
              onClick={onConnect}
              className={cn(
                'inline-flex items-center gap-1.5 text-xs font-semibold px-4 py-1.5 rounded-lg transition-all',
                platform.color,
                platform.bg,
                `hover:ring-1 ${platform.ring}`,
              )}
            >
              <ExternalLink className="h-3.5 w-3.5" />
              Connect
            </button>
          )
        )}
      </div>
    </div>
  );
}

// ─── Page ─────────────────────────────────────────────────────────────────────

export default function ConnectPage() {
  const auth = useBrandAuthContext();
  const searchParams = useSearchParams();
  const toastedRef = useRef(false);

  const [statuses, setStatuses] = useState<Record<string, ConnectionStatus>>(
    Object.fromEntries(PLATFORMS.map(p => [p.id, { connected: false, loading: p.available }]))
  );

  // Load Facebook + Instagram connection status on mount
  useEffect(() => {
    if (auth.isLoading) return;

    if (!auth.token) {
      setStatuses(prev => ({
        ...prev,
        facebook: { connected: false, loading: false },
        instagram: { connected: false, loading: false },
      }));
      return;
    }

    facebookSessionAPI.getSession(auth.token)
      .then(res => {
        setStatuses(prev => ({
          ...prev,
          facebook: {
            connected: res.data.connected,
            user_name: res.data.user_name,
            loading: false,
          },
        }));
      })
      .catch(() => {
        setStatuses(prev => ({ ...prev, facebook: { connected: false, loading: false } }));
      });

    instagramSessionAPI.getSession(auth.token)
      .then(res => {
        setStatuses(prev => ({
          ...prev,
          instagram: {
            connected: res.data.connected,
            user_name: res.data.username ? `@${res.data.username}` : null,
            loading: false,
          },
        }));
      })
      .catch(() => {
        setStatuses(prev => ({ ...prev, instagram: { connected: false, loading: false } }));
      });
  }, [auth.token, auth.isLoading]);

  // Show success toast if redirected back after connecting
  useEffect(() => {
    const connected = searchParams.get('connected');
    if ((connected === 'facebook' || connected === 'instagram') && !toastedRef.current) {
      toastedRef.current = true;
      toast.success(`${connected.charAt(0).toUpperCase() + connected.slice(1)} connected successfully!`);
    }
  }, [searchParams]);

  const handleConnect = async (platformId: string) => {
    if (!auth.token) {
      toast.error('You must be logged in to connect');
      return;
    }

    if (platformId === 'facebook') {
      try {
        const res = await authAPI.login(auth.token);
        window.location.href = res.data.login_url;
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        toast.error(detail ?? 'Failed to initiate Facebook connection');
      }
    } else if (platformId === 'instagram') {
      try {
        const res = await instagramSessionAPI.connect(auth.token);
        window.location.href = res.data.login_url;
      } catch (err: unknown) {
        const detail = (err as { response?: { data?: { detail?: string } } })?.response?.data?.detail;
        toast.error(detail ?? 'Failed to initiate Instagram connection');
      }
    }
  };

  const handleDisconnect = async (platformId: string) => {
    if (!auth.token) return;

    if (platformId === 'facebook') {
      setStatuses(prev => ({ ...prev, facebook: { ...prev.facebook, loading: true } }));
      try {
        await facebookSessionAPI.disconnect(auth.token);
        setStatuses(prev => ({ ...prev, facebook: { connected: false, loading: false } }));
        toast.success('Facebook disconnected');
      } catch {
        toast.error('Failed to disconnect Facebook');
        setStatuses(prev => ({ ...prev, facebook: { ...prev.facebook, loading: false } }));
      }
    } else if (platformId === 'instagram') {
      setStatuses(prev => ({ ...prev, instagram: { ...prev.instagram, loading: true } }));
      try {
        await instagramSessionAPI.disconnect(auth.token);
        setStatuses(prev => ({ ...prev, instagram: { connected: false, loading: false } }));
        toast.success('Instagram disconnected');
      } catch {
        toast.error('Failed to disconnect Instagram');
        setStatuses(prev => ({ ...prev, instagram: { ...prev.instagram, loading: false } }));
      }
    }
  };

  return (
    <div className="flex flex-col h-full">
      {/* Header */}
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Platform Connections</h1>
        <p className="text-xs text-slate-500 dark:text-purple-400 mt-0.5">Connect your social media accounts to start tracking data</p>
      </div>

      {/* Content */}
      <div className="flex-1 overflow-y-auto p-6 bg-slate-50 dark:bg-dk-bg">
        <div className="max-w-4xl mx-auto">

          {/* Intro */}
          <div className="mb-8">
            <p className="text-sm text-slate-500 dark:text-white/40">
              Connect your accounts once — AdSync will sync data automatically. Each connection is securely stored and linked to your brand.
            </p>
          </div>

          {/* Platform grid */}
          <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4">
            {PLATFORMS.map(platform => (
              <PlatformCard
                key={platform.id}
                platform={platform}
                status={statuses[platform.id]}
                onConnect={() => handleConnect(platform.id)}
                onDisconnect={() => handleDisconnect(platform.id)}
              />
            ))}
          </div>
        </div>
      </div>
    </div>
  );
}
