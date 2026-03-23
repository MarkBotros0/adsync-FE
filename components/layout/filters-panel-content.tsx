'use client';

import { useState } from 'react';
import * as Select from '@radix-ui/react-select';
import { ChevronDown, Check, CalendarDays, Calendar } from 'lucide-react';
import { useFilters, DATE_PRESETS } from '@/contexts/filter-context';
import type { DatePreset } from '@/contexts/filter-context';
import type { MentionPlatform, Sentiment, Emotion } from '@/lib/types';

// ─── Platform icons ────────────────────────────────────────────────────────────

const PLATFORM_BG: Record<string, string> = {
  twitter:   'bg-black',
  facebook:  'bg-blue-600',
  instagram: 'bg-pink-500',
  tiktok:    'bg-gray-900',
  youtube:   'bg-red-500',
  linkedin:  'bg-blue-700',
};

function PlatformIcon({ platform }: { platform: MentionPlatform }) {
  const cls = 'h-6 w-6 xl:h-4 xl:w-4 fill-white';
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

const SENTIMENTS: { value: Sentiment; label: string; dot: string }[] = [
  { value: 'negative', label: 'Negative', dot: 'bg-red-400'   },
  { value: 'neutral',  label: 'Neutral',  dot: 'bg-slate-400' },
  { value: 'positive', label: 'Positive', dot: 'bg-green-400' },
];

const EMOTIONS: { value: Emotion; label: string; emoji: string }[] = [
  { value: 'love',     label: 'Love',     emoji: '❤️'  },
  { value: 'joy',      label: 'Joy',      emoji: '😊'  },
  { value: 'fear',     label: 'Fear',     emoji: '😨'  },
  { value: 'anger',    label: 'Anger',    emoji: '😡'  },
  { value: 'sadness',  label: 'Sadness',  emoji: '😢'  },
  { value: 'surprise', label: 'Surprise', emoji: '😲'  },
  { value: 'disgust',  label: 'Disgust',  emoji: '🤢'  },
];

const ACTIVE_PLATFORMS: MentionPlatform[] = ['facebook', 'instagram', 'tiktok'];
const SOON_PLATFORMS:   MentionPlatform[] = ['twitter', 'youtube', 'linkedin'];

export interface FiltersPanelContentProps {
  selectedPlatforms: MentionPlatform[];
  onTogglePlatform: (p: MentionPlatform) => void;
  selectedSentiments: Sentiment[];
  onToggleSentiment: (s: Sentiment) => void;
  selectedEmotions: Emotion[];
  onToggleEmotion: (e: Emotion) => void;
  datePreset: DatePreset;
  onDatePresetChange: (preset: DatePreset) => void;
  customFrom: string | null;
  customTo: string | null;
  onCustomFromChange: (d: string | null) => void;
  onCustomToChange: (d: string | null) => void;
}

export function FiltersPanelContent({
  selectedPlatforms,
  onTogglePlatform,
  selectedSentiments,
  onToggleSentiment,
  selectedEmotions,
  onToggleEmotion,
  datePreset,
  onDatePresetChange,
  customFrom,
  customTo,
  onCustomFromChange,
  onCustomToChange,
}: FiltersPanelContentProps) {
  const [_language] = useState('All Languages');
  const { postsByPlatform } = useFilters();

  return (
    <div className="px-3 py-4 space-y-5">

      {/* Date range */}
      <div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Date Range</p>

        <Select.Root value={datePreset} onValueChange={v => onDatePresetChange(v as DatePreset)}>
          <Select.Trigger className="w-full flex items-center justify-between gap-2 px-3 py-2.5 xl:py-2 rounded-xl bg-slate-50 dark:bg-dk-raised border border-slate-200 dark:border-dk-border text-xs text-slate-700 dark:text-slate-200 hover:border-violet-400 dark:hover:border-violet-500 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all group">
            <span className="flex items-center gap-2 min-w-0">
              <CalendarDays className="h-3.5 w-3.5 text-violet-400 shrink-0" />
              <Select.Value />
            </span>
            <Select.Icon>
              <ChevronDown className="h-3.5 w-3.5 text-slate-400 group-data-[state=open]:rotate-180 transition-transform duration-150" />
            </Select.Icon>
          </Select.Trigger>

          <Select.Portal>
            <Select.Content
              position="popper"
              sideOffset={6}
              className="z-50 w-[var(--radix-select-trigger-width)] bg-white dark:bg-dk-surface border border-slate-200 dark:border-dk-border rounded-xl shadow-xl overflow-hidden animate-in fade-in-0 zoom-in-95"
            >
              <Select.Viewport className="p-1">
                {DATE_PRESETS.map(p => (
                  <Select.Item
                    key={p.key}
                    value={p.key}
                    className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none outline-none data-[highlighted]:bg-violet-500/10 data-[highlighted]:text-violet-300 data-[state=checked]:text-violet-300 data-[state=checked]:font-medium transition-colors"
                  >
                    <Select.ItemText>{p.label}</Select.ItemText>
                    <Select.ItemIndicator>
                      <Check className="h-3 w-3 text-violet-400" />
                    </Select.ItemIndicator>
                  </Select.Item>
                ))}

                <Select.Separator className="my-1 h-px bg-slate-100 dark:bg-dk-border" />

                <Select.Item
                  value="custom"
                  className="flex items-center justify-between px-3 py-2 rounded-lg text-xs text-slate-600 dark:text-slate-300 cursor-pointer select-none outline-none data-[highlighted]:bg-violet-500/10 data-[highlighted]:text-violet-300 data-[state=checked]:text-violet-300 data-[state=checked]:font-medium transition-colors"
                >
                  <span className="flex items-center gap-2">
                    <Calendar className="h-3 w-3 opacity-60" />
                    <Select.ItemText>Custom range</Select.ItemText>
                  </span>
                  <Select.ItemIndicator>
                    <Check className="h-3 w-3 text-violet-400" />
                  </Select.ItemIndicator>
                </Select.Item>
              </Select.Viewport>
            </Select.Content>
          </Select.Portal>
        </Select.Root>

        {datePreset === 'custom' && (
          <div className="mt-2.5 space-y-2">
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">From</label>
              <input
                type="date"
                value={customFrom ?? ''}
                max={customTo ?? undefined}
                onChange={e => onCustomFromChange(e.target.value || null)}
                className="w-full bg-slate-50 dark:bg-dk-raised border border-slate-200 dark:border-dk-border rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all dark:[color-scheme:dark]"
              />
            </div>
            <div>
              <label className="block text-[10px] font-medium text-slate-500 dark:text-slate-400 uppercase tracking-wide mb-1">To</label>
              <input
                type="date"
                value={customTo ?? ''}
                min={customFrom ?? undefined}
                onChange={e => onCustomToChange(e.target.value || null)}
                className="w-full bg-slate-50 dark:bg-dk-raised border border-slate-200 dark:border-dk-border rounded-lg px-2 py-1.5 text-xs text-slate-700 dark:text-slate-300 focus:outline-none focus:ring-2 focus:ring-violet-500/40 transition-all dark:[color-scheme:dark]"
              />
            </div>
          </div>
        )}
      </div>

      <hr className="border-slate-200 dark:border-dk-border" />

      {/* Platform grid */}
      <div className="grid grid-cols-3 gap-1.5">
        {ACTIVE_PLATFORMS.map(platform => {
          const count = postsByPlatform[platform] ?? 0;
          const active = selectedPlatforms.includes(platform);
          return (
            <button
              key={platform}
              onClick={() => onTogglePlatform(platform)}
              title={platform}
              className={`flex flex-col items-center gap-1 p-2 xl:p-1.5 rounded-xl xl:rounded-lg transition-all
                ${active ? 'ring-2 ring-purple-400 ring-offset-1 dark:ring-offset-dk-surface' : 'hover:bg-slate-50 dark:hover:bg-dk-raised'}`}
            >
              <div className={`h-12 w-12 xl:h-7 xl:w-7 rounded-xl xl:rounded-lg flex items-center justify-center ${PLATFORM_BG[platform] ?? 'bg-slate-400'}`}>
                <PlatformIcon platform={platform} />
              </div>
              <span className="text-xs xl:text-[10px] text-slate-500 font-medium">{count}</span>
            </button>
          );
        })}
        {SOON_PLATFORMS.map(platform => (
          <div
            key={platform}
            title={`${platform} — coming soon`}
            className="flex flex-col items-center gap-1 p-2 xl:p-1.5 rounded-xl xl:rounded-lg opacity-40 cursor-default"
          >
            <div className={`h-12 w-12 xl:h-7 xl:w-7 rounded-xl xl:rounded-lg flex items-center justify-center ${PLATFORM_BG[platform] ?? 'bg-slate-400'}`}>
              <PlatformIcon platform={platform} />
            </div>
            <span className="text-[10px] xl:text-[9px] text-slate-400 font-medium leading-none">soon</span>
          </div>
        ))}
      </div>

      <hr className="border-slate-200 dark:border-dk-border" />

      {/* Sentiment */}
      <div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Sentiment</p>
        <div className="space-y-1.5">
          {SENTIMENTS.map(s => (
            <button
              key={s.value}
              onClick={() => onToggleSentiment(s.value)}
              className={`w-full flex items-center gap-2.5 px-3 xl:px-2 py-3 xl:py-1.5 rounded-lg text-sm xl:text-xs transition-colors
                ${selectedSentiments.includes(s.value)
                  ? 'bg-violet-500/15 text-violet-200 font-medium'
                  : 'text-slate-600 dark:text-slate-400 hover:bg-slate-50 dark:hover:bg-dk-raised'}`}
            >
              <span className={`h-2.5 w-2.5 xl:h-2 xl:w-2 rounded-full ${s.dot}`} />
              {s.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-dk-border" />

      {/* Emotion */}
      <div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Emotion</p>
        <div className="flex flex-wrap gap-2 xl:gap-1.5">
          {EMOTIONS.map(e => (
            <button
              key={e.value}
              onClick={() => onToggleEmotion(e.value)}
              className={`flex items-center gap-1.5 xl:gap-1 px-3 xl:px-2 py-1.5 xl:py-1 rounded-full text-sm xl:text-xs border transition-colors
                ${selectedEmotions.includes(e.value)
                  ? 'bg-violet-500/15 border-violet-500/50 text-violet-200 font-medium'
                  : 'border-slate-200 dark:border-dk-border text-slate-600 dark:text-slate-400 hover:border-slate-300 dark:hover:border-white/20'}`}
            >
              <span>{e.emoji}</span>
              {e.label}
            </button>
          ))}
        </div>
      </div>

      <hr className="border-slate-200 dark:border-dk-border" />

      {/* Language */}
      <div>
        <p className="text-xs font-semibold text-slate-700 dark:text-slate-300 uppercase tracking-wide mb-2">Language</p>
        <span className="inline-flex items-center gap-1 bg-slate-100 dark:bg-dk-raised text-slate-500 dark:text-slate-400 text-xs px-2 py-1 rounded-full font-medium cursor-not-allowed">
          All Languages
          <span className="text-[9px] font-semibold bg-slate-200 dark:bg-white/8 text-slate-400 dark:text-slate-500 px-1 rounded uppercase tracking-wide">Soon</span>
        </span>
      </div>
    </div>
  );
}
