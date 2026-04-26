'use client';

import { Globe, Instagram, MapPin, Music2, Newspaper, Search } from 'lucide-react';
import { COMPETITOR_ACTOR_KEYS, COMPETITOR_ACTOR_LABELS } from '@/lib/constants';
import type {
  CompetitorActorKey,
  CompetitorTargetInput,
  CompetitorTargetType,
} from '@/lib/types';

const ACTOR_ICONS: Record<CompetitorActorKey, typeof Globe> = {
  facebook_ads: Newspaper,
  instagram: Instagram,
  tiktok: Music2,
  google_search: Search,
  website: Globe,
  google_places: MapPin,
};

const ACTOR_PLACEHOLDERS: Record<CompetitorActorKey, string> = {
  facebook_ads: 'https://www.facebook.com/audi',
  instagram: '@audi',
  tiktok: '@audi',
  google_search: 'Audi',
  website: 'https://www.audi.com',
  google_places: 'Audi dealer',
};

const ACTOR_DEFAULT_TYPES: Record<CompetitorActorKey, CompetitorTargetType> = {
  facebook_ads: 'url',
  instagram: 'handle',
  tiktok: 'handle',
  google_search: 'query',
  website: 'url',
  google_places: 'query',
};

const ACTOR_HINTS: Record<CompetitorActorKey, string> = {
  facebook_ads: 'Facebook Page URL (precise) or brand keyword',
  instagram: 'Instagram handle, no @ needed',
  tiktok: 'TikTok handle, no @ needed',
  google_search: 'Search query — usually the brand name',
  website: 'Public website URL',
  google_places: 'Google Maps search — e.g. brand + city',
};

export type TargetMap = Partial<Record<CompetitorActorKey, string>>;

interface CompetitorTargetFormProps {
  values: TargetMap;
  onChange: (key: CompetitorActorKey, value: string) => void;
  disabled?: boolean;
  /** When true, omit Google Places and Google Search from the displayed list. */
  hideQueryActors?: boolean;
}

export function CompetitorTargetForm({
  values,
  onChange,
  disabled = false,
  hideQueryActors = false,
}: CompetitorTargetFormProps) {
  const keys = COMPETITOR_ACTOR_KEYS.filter((k) =>
    hideQueryActors ? k !== 'google_search' && k !== 'google_places' : true,
  );

  return (
    <div className="space-y-3">
      {keys.map((key) => {
        const Icon = ACTOR_ICONS[key];
        const value = values[key] ?? '';
        return (
          <div key={key} className="space-y-1.5">
            <label
              htmlFor={`target-${key}`}
              className="flex items-center gap-2 text-xs font-medium text-slate-600 dark:text-slate-300"
            >
              <Icon className="h-3.5 w-3.5" />
              {COMPETITOR_ACTOR_LABELS[key]}
              <span className="ml-auto text-[10px] uppercase tracking-wide text-slate-400 dark:text-slate-500">
                optional
              </span>
            </label>
            <input
              id={`target-${key}`}
              type="text"
              value={value}
              onChange={(e) => onChange(key, e.target.value)}
              placeholder={ACTOR_PLACEHOLDERS[key]}
              disabled={disabled}
              maxLength={600}
              className="block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 dark:border-dk-border dark:bg-dk-raised dark:text-white"
            />
            <p className="text-[11px] text-slate-500 dark:text-slate-400">{ACTOR_HINTS[key]}</p>
          </div>
        );
      })}
    </div>
  );
}

export function buildTargetInputs(
  values: TargetMap,
  competitorName: string,
): CompetitorTargetInput[] {
  const out: CompetitorTargetInput[] = [];
  for (const key of COMPETITOR_ACTOR_KEYS) {
    const raw = (values[key] ?? '').trim();
    // Default the SERP query to the competitor name so the user doesn't have to retype it.
    if (!raw && key === 'google_search' && competitorName.trim()) {
      out.push({
        actor_key: key,
        target_value: competitorName.trim(),
        target_type: 'query',
      });
      continue;
    }
    if (!raw) continue;
    out.push({
      actor_key: key,
      target_value: raw,
      target_type: ACTOR_DEFAULT_TYPES[key],
    });
  }
  return out;
}
