'use client';

import { useState, useEffect, useCallback, useRef } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { Sidebar } from '@/components/layout/Sidebar';
import { RightPanel } from '@/components/layout/RightPanel';
import { authAPI, pagesAPI } from '@/lib/api';
import type { FacebookPage, MentionPlatform, Sentiment, Emotion } from '@/lib/types';
import { FilterContext, DATE_PRESETS, type DatePreset } from '@/contexts/filter-context';
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
        className="inline-flex items-center gap-1.5 bg-purple-50 border border-purple-200 text-purple-700 text-xs font-medium px-3 py-1.5 rounded-full hover:bg-purple-100 transition-colors"
      >
        <CalendarDays className="h-3 w-3" />
        {label}
        <ChevronDown className={`h-3 w-3 transition-transform ${open ? 'rotate-180' : ''}`} />
      </button>

      {open && (
        <div className="absolute left-0 top-full mt-1.5 z-50 bg-white border border-slate-200 rounded-xl shadow-lg overflow-hidden min-w-[160px]">
          {DATE_PRESETS.map(p => (
            <button
              key={p.key}
              onClick={() => { onChange(p.key); setOpen(false); }}
              className={`w-full text-left px-4 py-2.5 text-xs font-medium transition-colors
                ${preset === p.key
                  ? 'bg-purple-50 text-purple-700'
                  : 'text-slate-600 hover:bg-slate-50'
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
  const [selectedPlatforms, setSelectedPlatforms] = useState<MentionPlatform[]>(['twitter']);
  const [selectedSentiments, setSelectedSentiments] = useState<Sentiment[]>([]);
  const [selectedEmotions, setSelectedEmotions]     = useState<Emotion[]>([]);
  const [datePreset, setDatePreset]           = useState<DatePreset>('3m');
  const searchParams = useSearchParams();
  const router = useRouter();

  const dateLabel = DATE_PRESETS.find(p => p.key === datePreset)?.label ?? 'Last 3 months';

  useEffect(() => {
    const session = searchParams.get('session_id') || sessionStorage.getItem('session_id');
    if (session) {
      sessionStorage.setItem('session_id', session);
      setSessionId(session);
      loadPages(session);
    }
  }, [searchParams]);

  const loadPages = async (session: string) => {
    try {
      const response = await pagesAPI.getPages(session);
      const pagesData: FacebookPage[] = response.data.pages || [];
      setPages(pagesData);
      if (pagesData.length > 0) setSelectedPage(pagesData[0]);
    } catch (err: any) {
      if (err.response?.status === 401 || err.response?.status === 400) {
        sessionStorage.removeItem('session_id');
        toast.error('Session expired. Please login again.');
        setTimeout(() => router.push('/'), 1000);
      }
    }
  };

  const handleLogout = async () => {
    if (!sessionId) return;
    try {
      await authAPI.logout(sessionId);
    } catch {}
    sessionStorage.removeItem('session_id');
    toast.success('Logged out');
    setTimeout(() => router.push('/'), 800);
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
      <div className="flex h-dvh overflow-hidden bg-slate-50">
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
          {/* Top filter bar */}
          <div className="shrink-0 bg-white border-b border-slate-200 px-4 py-3 flex items-center gap-3 flex-wrap">
            {/* Mobile hamburger */}
            <button
              className="lg:hidden text-slate-600 hover:text-slate-900"
              onClick={() => setIsMobileOpen(true)}
            >
              <Menu className="h-5 w-5" />
            </button>

            {/* Date picker */}
            <DatePicker preset={datePreset} onChange={setDatePreset} />

            {/* Active platform pills */}
            {selectedPlatforms.map(p => (
              <span
                key={p}
                className="inline-flex items-center gap-1.5 bg-slate-100 text-slate-700 text-xs font-medium px-3 py-1.5 rounded-full"
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
                className="ml-auto text-xs text-slate-500 hover:text-slate-800 font-medium px-3 py-1.5 rounded-full hover:bg-slate-50 transition-colors"
              >
                Clear Filters
              </button>
            )}
          </div>

          {/* Page content */}
          <div className="flex flex-1 min-h-0 overflow-hidden">
            <main className="flex-1 overflow-y-auto">
              {children}
            </main>

            {/* Right panel */}
            <RightPanel
              selectedPlatforms={selectedPlatforms}
              onTogglePlatform={togglePlatform}
              selectedSentiments={selectedSentiments}
              onToggleSentiment={toggleSentiment}
              selectedEmotions={selectedEmotions}
              onToggleEmotion={toggleEmotion}
            />
          </div>
        </div>
      </div>
    </FilterContext.Provider>
  );
}
