'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { authAPI, pagesAPI, facebookSessionAPI } from '@/lib/api';
import type { FacebookPage, MentionPlatform, Sentiment, Emotion } from '@/lib/types';
import { FilterContext, DATE_PRESETS, type DatePreset } from '@/contexts/filter-context';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { toast } from 'sonner';
import { Menu, X, CalendarDays, ChevronDown } from 'lucide-react';

// ─── Platform label map ───────────────────────────────────────────────────────
const PLATFORM_LABELS: Record<MentionPlatform, string> = {
  twitter:   'X(Twitter)',
  facebook:  'Facebook',
  instagram: 'Instagram',
  tiktok:    'TikTok',
  youtube:   'YouTube',
  linkedin:  'LinkedIn',
  bluesky:   'Bluesky',
  reddit:    'Reddit',
  forums:    'Forums',
  news:      'News',
  blogs:     'Blogs',
  web:       'Web',
};

function DatePicker({ preset, onChange }: { preset: DatePreset; onChange: (p: DatePreset) => void }) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const label = DATE_PRESETS.find(p => p.key === preset)?.label ?? 'Date range';

  useEffect(() => {
    function onClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) setOpen(false);
    }
    document.addEventListener('mousedown', onClickOutside);
    return () => document.removeEventListener('mousedown', onClickOutside);
  }, []);

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(o => !o)}
        className="inline-flex items-center gap-1.5 bg-purple-50 dark:bg-purple-900/30 border border-purple-200 dark:border-purple-700/50 text-purple-700 dark:text-purple-300 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-purple-100 dark:hover:bg-purple-900/50 transition-colors"
      >
        <CalendarDays className="h-3 w-3" />
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white dark:bg-dk-surface border border-slate-200 dark:border-dk-border rounded-xl shadow-lg overflow-hidden min-w-[160px]">
          {DATE_PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => { onChange(p.key); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors
                ${preset === p.key
                  ? 'bg-purple-900/60 text-purple-200'
                  : 'text-slate-600 dark:text-purple-300 hover:bg-slate-50 dark:hover:bg-dk-raised'
                }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      )}
    </div>
  );
}

export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen]       = useState(false);
  const [sessionId, setSessionId]             = useState<string | null>(null);
  const [pages, setPages]                     = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage]       = useState<FacebookPage | null>(null);
  const [totalPosts, setTotalPosts]           = useState(0);
  const [selectedPlatforms, setSelectedPlatforms] = useState<MentionPlatform[]>([]);
  const [selectedSentiments, setSelectedSentiments] = useState<Sentiment[]>([]);
  const [selectedEmotions, setSelectedEmotions]     = useState<Emotion[]>([]);
  const [datePreset, setDatePreset]           = useState<DatePreset>('3m');
  const searchParams = useSearchParams();
  const router = useRouter();
  const pathname = usePathname();
  const auth = useBrandAuthContext();

  const dateLabel = DATE_PRESETS.find(p => p.key === datePreset)?.label ?? 'Last 3 months';

  // Load the brand's linked Facebook session from the API
  useEffect(() => {
    if (!auth.token || auth.isLoading) return;
    facebookSessionAPI.getSession(auth.token).then(res => {
      if (res.data.connected && res.data.session_id) {
        setSessionId(res.data.session_id);
        loadPages(res.data.session_id);
      }
    }).catch(() => {});
  }, [auth.token, auth.isLoading]);

  const loadPages = async (session: string) => {
    try {
      const response = await pagesAPI.getPages(session);
      const pagesData: FacebookPage[] = response.data.pages || [];
      setPages(pagesData);
      if (pagesData.length > 0) setSelectedPage(pagesData[0]);
    } catch (err: unknown) {
      const status = (err as { response?: { status?: number } })?.response?.status;
      if (status === 401) {
        // Facebook access token has expired. Auto-disconnect the stale session so
        // the Connections page reflects reality ("Not connected") and the user can reconnect.
        setSessionId(null);
        setPages([]);
        if (auth.token) {
          facebookSessionAPI.disconnect(auth.token).catch(() => {});
        }
        toast.error('Your Facebook connection has expired. Please reconnect.');
      }
    }
  };

  // Redirect to login when auth has finished loading and there's no valid session
  useEffect(() => {
    if (!auth.isLoading && !auth.isAuthenticated) {
      router.replace('/login');
    }
  }, [auth.isLoading, auth.isAuthenticated, router]);

  const handleLogout = async () => {
    try { await auth.logout(); } catch {}
    toast.success('Logged out');
    router.push('/login');
  };

  const handlePageSelect = useCallback((page: FacebookPage) => {
    setSelectedPage(page);
    toast.success(`Switched to ${page.name}`);
  }, []);

  const togglePlatform = (p: MentionPlatform) =>
    setSelectedPlatforms(prev =>
      prev.includes(p) ? prev.filter(x => x !== p) : [...prev, p],
    );

  const toggleSentiment = (s: Sentiment) =>
    setSelectedSentiments(prev =>
      prev.includes(s) ? prev.filter(x => x !== s) : [...prev, s],
    );

  const toggleEmotion = (e: Emotion) =>
    setSelectedEmotions(prev =>
      prev.includes(e) ? prev.filter(x => x !== e) : [...prev, e],
    );

  const clearAll = () => {
    setSelectedPlatforms([]);
    setSelectedSentiments([]);
    setSelectedEmotions([]);
  };

  return (
    <SidebarProvider>
    <FilterContext.Provider value={{
      selectedPlatforms,
      togglePlatform,
      selectedSentiments,
      toggleSentiment,
      selectedEmotions,
      toggleEmotion,
      datePreset,
      dateLabel,
      setDatePreset,
      clearAll,
      sessionId,
      pages,
      selectedPage,
      onPageSelect: handlePageSelect,
      totalPosts,
      setTotalPosts,
    }}>
      <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-dk-bg">
        {/* Left sidebar */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onLogout={handleLogout}
          pages={pages}
          selectedPage={selectedPage}
          onPageSelect={handlePageSelect}
        />

        {/* Main area (top bar + content) */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Mobile-only top bar — always visible so hamburger is accessible on all pages */}
          <div className="lg:hidden shrink-0 bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-4 py-3">
            <button
              className="text-slate-600 dark:text-purple-300 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>
          </div>

          {/* Top filter bar — only shown on Mentions */}
          {pathname === '/mentions' && <div className="shrink-0 bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-4 py-3 flex items-center gap-3 flex-wrap">
            {/* Date picker */}
            <DatePicker preset={datePreset} onChange={setDatePreset} />

            {/* Active platform pills */}
            {selectedPlatforms.map(p => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 bg-slate-100 dark:bg-dk-raised text-slate-700 dark:text-purple-200 text-xs font-medium px-3 py-1.5 rounded-full"
              >
                {PLATFORM_LABELS[p]}
                <button
                  onClick={() => togglePlatform(p)}
                  className="hover:text-red-500 transition-colors"
                >
                  <X className="h-3 w-3" />
                </button>
              </span>
            ))}

            {(selectedPlatforms.length > 0 || selectedSentiments.length > 0 || selectedEmotions.length > 0) && (
              <button
                onClick={clearAll}
                className="ml-auto text-xs text-slate-500 dark:text-purple-400 hover:text-slate-800 dark:hover:text-purple-200 font-medium px-3 py-1.5 rounded-full hover:bg-slate-50 dark:hover:bg-dk-raised transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>}

          {/* Page content */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

            {/* Right panel — only shown on Mentions */}
            {pathname === '/mentions' && (
              <RightPanel
                selectedPlatforms={selectedPlatforms}
                onTogglePlatform={togglePlatform}
                selectedSentiments={selectedSentiments}
                onToggleSentiment={toggleSentiment}
                selectedEmotions={selectedEmotions}
                onToggleEmotion={toggleEmotion}
              />
            )}
          </div>
        </div>
      </div>
    </FilterContext.Provider>
    </SidebarProvider>
  );
}
