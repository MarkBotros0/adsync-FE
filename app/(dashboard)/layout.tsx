'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useRouter, usePathname } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { MobileFiltersSheet } from '@/components/layout/mobile-filters-sheet';
import { pagesAPI, facebookSessionAPI, instagramSessionAPI, tiktokSessionAPI, contentFeedAPI } from '@/lib/api';
import type { FacebookPage, MentionPlatform, Sentiment, Emotion, ConnectionStatuses, Mention, MentionStats } from '@/lib/types';
import { FilterContext, DATE_PRESETS, type DatePreset } from '@/contexts/filter-context';
import { ContentDataContext } from '@/contexts/content-data-context';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { SidebarProvider } from '@/contexts/sidebar-context';
import { toast } from 'sonner';
import { Menu, SlidersHorizontal } from 'lucide-react';


export default function DashboardLayout({ children }: { children: React.ReactNode }) {
  const [isMobileOpen, setIsMobileOpen]           = useState(false);
  const [isMobileFiltersOpen, setIsMobileFiltersOpen] = useState(false);
  const [sessionId, setSessionId]             = useState<string | null>(null);
  const [igSessionId, setIgSessionId]         = useState<string | null>(null);
  const [igUserId, setIgUserId]               = useState<string | null>(null);
  const [ttSessionId, setTtSessionId]         = useState<string | null>(null);
  const [ttOpenId, setTtOpenId]               = useState<string | null>(null);
  const [connectionStatuses, setConnectionStatuses] = useState<ConnectionStatuses>({
    facebook: { connected: false, user_name: null, loading: true },
    instagram: { connected: false, user_name: null, loading: true },
    tiktok: { connected: false, user_name: null, loading: true },
  });
  const [pages, setPages]                     = useState<FacebookPage[]>([]);
  const [selectedPage, setSelectedPage]       = useState<FacebookPage | null>(null);
  const [totalPosts, setTotalPosts]           = useState(0);
  const [postsByPlatform, setPostsByPlatform] = useState<Partial<Record<MentionPlatform, number>>>({});
  const [selectedPlatforms, setSelectedPlatforms] = useState<MentionPlatform[]>([]);
  const [selectedSentiments, setSelectedSentiments] = useState<Sentiment[]>([]);
  const [selectedEmotions, setSelectedEmotions]     = useState<Emotion[]>([]);
  const [datePreset, setDatePreset]           = useState<DatePreset>('all');
  const [customFrom, setCustomFrom]           = useState<string | null>(null);
  const [customTo, setCustomTo]               = useState<string | null>(null);

  // ── Content data (global cache, fetched once per session) ─────────────────
  const [mentions, setMentions]               = useState<Mention[]>([]);
  const [contentStats, setContentStats]       = useState<MentionStats | null>(null);
  const [contentLoading, setContentLoading]   = useState(false);
  const [contentLoaded, setContentLoaded]     = useState(false);
  const fetchingRef = useRef(false);
  const loadedBrandIdRef = useRef<number | null | undefined>(undefined);

  const router = useRouter();
  const pathname = usePathname();
  const auth = useBrandAuthContext();

  const brandId = auth.brand?.id ?? null;

  const dateLabel = datePreset === 'custom' ? 'Custom range' : (DATE_PRESETS.find(p => p.key === datePreset)?.label ?? 'Last 3 months');
  const activeFilterCount =
    selectedPlatforms.length +
    selectedSentiments.length +
    selectedEmotions.length +
    (datePreset !== 'all' ? 1 : 0);

  const showFiltersPanel = pathname === '/content' || pathname === '/analytics';

  // Load the brand's linked platform sessions from the API (called once on auth, and after connect/disconnect)
  const loadSessions = useCallback(async () => {
    if (!auth.token) return;
    setConnectionStatuses(prev => ({
      facebook: { ...prev.facebook, loading: true },
      instagram: { ...prev.instagram, loading: true },
      tiktok: { ...prev.tiktok, loading: true },
    }));
    facebookSessionAPI.getSession(auth.token).then(res => {
      if (res.data.connected && res.data.session_id) {
        setSessionId(res.data.session_id);
        loadPages(res.data.session_id);
      } else {
        setSessionId(null);
      }
      setConnectionStatuses(prev => ({
        ...prev,
        facebook: { connected: res.data.connected, user_name: res.data.user_name, loading: false },
      }));
    }).catch(() => {
      setConnectionStatuses(prev => ({ ...prev, facebook: { connected: false, user_name: null, loading: false } }));
    });
    instagramSessionAPI.getSession(auth.token).then(res => {
      if (res.data.connected && res.data.session_id && res.data.ig_user_id) {
        setIgSessionId(res.data.session_id);
        setIgUserId(res.data.ig_user_id);
      } else {
        setIgSessionId(null);
        setIgUserId(null);
      }
      setConnectionStatuses(prev => ({
        ...prev,
        instagram: { connected: res.data.connected, user_name: res.data.username ? `@${res.data.username}` : null, loading: false },
      }));
    }).catch(() => {
      setConnectionStatuses(prev => ({ ...prev, instagram: { connected: false, user_name: null, loading: false } }));
    });
    tiktokSessionAPI.getSession(auth.token).then(res => {
      if (res.data.connected && res.data.session_id && res.data.open_id) {
        setTtSessionId(res.data.session_id);
        setTtOpenId(res.data.open_id);
      } else {
        setTtSessionId(null);
        setTtOpenId(null);
      }
      setConnectionStatuses(prev => ({
        ...prev,
        tiktok: { connected: res.data.connected, user_name: res.data.display_name, loading: false },
      }));
    }).catch(() => {
      setConnectionStatuses(prev => ({ ...prev, tiktok: { connected: false, user_name: null, loading: false } }));
    });
  }, [auth.token]);

  useEffect(() => {
    if (!auth.token || auth.isLoading) return;
    loadSessions();
  }, [auth.token, auth.isLoading, loadSessions]);

  // Reset content cache when the user switches to a different brand
  useEffect(() => {
    if (loadedBrandIdRef.current !== undefined && loadedBrandIdRef.current !== brandId) {
      setContentLoaded(false);
      setMentions([]);
      setContentStats(null);
      setTotalPosts(0);
      setPostsByPlatform({});
      fetchingRef.current = false;
    }
    loadedBrandIdRef.current = brandId;
  }, [brandId]);

  // ── Unified content fetch ─────────────────────────────────────────────────
  const loadContent = useCallback(async () => {
    if (!auth.token || fetchingRef.current) return;
    fetchingRef.current = true;
    setContentLoading(true);
    try {
      const res = await contentFeedAPI.getFeed(auth.token, { page_size: 200 });
      if (res.data.success) {
        const { items, stats } = res.data.data;
        setMentions(items);
        setContentStats(stats as MentionStats);
        setTotalPosts(items.length);
        const counts: Partial<Record<MentionPlatform, number>> = {};
        for (const m of items) {
          counts[m.platform] = (counts[m.platform] ?? 0) + 1;
        }
        setPostsByPlatform(counts);
        setContentLoaded(true);
      }
    } catch {
      // Silently fail — not all platforms may be connected
    } finally {
      fetchingRef.current = false;
      setContentLoading(false);
    }
  }, [auth.token]);

  // Load once when auth is ready and data hasn't been fetched yet
  useEffect(() => {
    if (auth.token && !auth.isLoading && !contentLoaded && !fetchingRef.current) {
      loadContent();
    }
  }, [auth.token, auth.isLoading, contentLoaded, loadContent]);

  const reloadContent = useCallback(() => {
    setContentLoaded(false);
    loadContent();
  }, [loadContent]);

  const deleteMention = useCallback((id: string) => {
    setMentions(prev => prev.filter(m => m.id !== id));
    setTotalPosts(prev => Math.max(0, prev - 1));
  }, []);

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

  // Redirect to login when auth has finished loading and there's no valid session.
  // If authenticated but no brand created yet, redirect to brand creation.
  useEffect(() => {
    if (auth.isLoading) return;
    if (!auth.isAuthenticated) {
      router.replace('/login');
    } else if (auth.requiresBrandCreation && pathname !== '/brands') {
      router.replace('/brands');
    }
  }, [auth.isLoading, auth.isAuthenticated, auth.requiresBrandCreation, pathname, router]);

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
      customFrom,
      customTo,
      setCustomFrom,
      setCustomTo,
      clearAll,
      sessionId,
      igSessionId,
      igUserId,
      ttSessionId,
      ttOpenId,
      connectionStatuses,
      setConnectionStatuses,
      refreshConnections: loadSessions,
      pages,
      selectedPage,
      onPageSelect: handlePageSelect,
      totalPosts,
      setTotalPosts,
      postsByPlatform,
      setPostsByPlatform,
    }}>
    <ContentDataContext.Provider value={{
      mentions,
      stats: contentStats,
      loading: contentLoading,
      loaded: contentLoaded,
      reload: reloadContent,
      deleteMention,
    }}>
      <div className="flex h-dvh overflow-hidden bg-slate-50 dark:bg-dk-bg">
        {/* Left sidebar */}
        <Sidebar
          isMobileOpen={isMobileOpen}
          setIsMobileOpen={setIsMobileOpen}
          onLogout={handleLogout}
          userRole={auth.user?.role ?? null}
          pages={pages}
          selectedPage={selectedPage}
          onPageSelect={handlePageSelect}
        />

        {/* Main area (top bar + content) */}
        <div className="flex flex-col flex-1 min-w-0 overflow-hidden">
          {/* Mobile-only top bar — always visible so hamburger is accessible on all pages */}
          <div className="lg:hidden shrink-0 bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-4 py-3 flex items-center justify-between">
            <button
              aria-label="Open navigation"
              className="text-slate-600 dark:text-slate-400 hover:text-slate-900 dark:hover:text-white"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Filters button — only on content/analytics pages */}
            {showFiltersPanel && (
              <button
                aria-label="Open filters"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dk-raised transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-violet-500 text-white text-[9px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            )}
          </div>

          {/* Tablet filter bar — visible on lg..xl gap where top bar is hidden but right panel isn't shown yet */}
          {showFiltersPanel && (
            <div className="hidden lg:flex xl:hidden shrink-0 items-center justify-end px-4 py-2 bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border">
              <button
                aria-label="Open filters"
                onClick={() => setIsMobileFiltersOpen(true)}
                className="relative flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-medium text-slate-600 dark:text-slate-300 hover:bg-slate-100 dark:hover:bg-dk-raised transition-colors"
              >
                <SlidersHorizontal className="h-4 w-4" />
                Filters
                {activeFilterCount > 0 && (
                  <span className="absolute -top-1 -right-1 inline-flex items-center justify-center h-4 min-w-4 px-1 rounded-full bg-violet-500 text-white text-[9px] font-bold">
                    {activeFilterCount}
                  </span>
                )}
              </button>
            </div>
          )}

          {/* Page content */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

            {/* Right panel — desktop xl+ only, shown on Content and Analytics */}
            {showFiltersPanel && (
              <RightPanel
                selectedPlatforms={selectedPlatforms}
                onTogglePlatform={togglePlatform}
                selectedSentiments={selectedSentiments}
                onToggleSentiment={toggleSentiment}
                selectedEmotions={selectedEmotions}
                onToggleEmotion={toggleEmotion}
                datePreset={datePreset}
                onDatePresetChange={setDatePreset}
                customFrom={customFrom}
                customTo={customTo}
                onCustomFromChange={setCustomFrom}
                onCustomToChange={setCustomTo}
              />
            )}
          </div>

          {/* Mobile/tablet filters bottom sheet */}
          {showFiltersPanel && (
            <MobileFiltersSheet
              isOpen={isMobileFiltersOpen}
              onClose={() => setIsMobileFiltersOpen(false)}
              activeFilterCount={activeFilterCount}
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={togglePlatform}
              selectedSentiments={selectedSentiments}
              onToggleSentiment={toggleSentiment}
              selectedEmotions={selectedEmotions}
              onToggleEmotion={toggleEmotion}
              datePreset={datePreset}
              onDatePresetChange={setDatePreset}
              customFrom={customFrom}
              customTo={customTo}
              onCustomFromChange={setCustomFrom}
              onCustomToChange={setCustomTo}
            />
          )}
        </div>
      </div>
    </ContentDataContext.Provider>
    </FilterContext.Provider>
    </SidebarProvider>
  );
}
