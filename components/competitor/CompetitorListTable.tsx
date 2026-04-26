'use client';

import Link from 'next/link';
import { Trash2, Users, Megaphone, Star, ChevronRight } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { JobProgress } from '@/components/competitor/JobProgress';
import { StatusPill } from '@/components/competitor/StatusPill';
import { formatNumber } from '@/lib/utils';
import type { Competitor } from '@/lib/types';

interface CompetitorListTableProps {
  competitors: Competitor[];
  onDelete: (competitor: Competitor) => void;
}

export function CompetitorListTable({ competitors, onDelete }: CompetitorListTableProps) {
  return (
    <>
      {/* Mobile: cards */}
      <ul className="space-y-3 md:hidden">
        {competitors.map((c) => (
          <CompetitorCard
            key={c.id}
            competitor={c}
            onDelete={() => onDelete(c)}
          />
        ))}
      </ul>

      {/* Tablet+: table */}
      <div className="hidden overflow-hidden rounded-xl border border-slate-200 bg-white shadow-sm md:block dark:border-dk-border dark:bg-dk-surface">
        <table className="min-w-full divide-y divide-slate-200 dark:divide-dk-border">
          <thead className="bg-slate-50 dark:bg-dk-raised/40">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3">Competitor</th>
              <th className="px-5 py-3">Status</th>
              <th className="px-5 py-3">Targets</th>
              <th className="px-5 py-3">Instagram</th>
              <th className="px-5 py-3">Active ads</th>
              <th className="px-5 py-3">Reviews</th>
              <th className="px-5 py-3 text-right">Actions</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-200 dark:divide-dk-border">
            {competitors.map((c) => (
              <CompetitorRow
                key={c.id}
                competitor={c}
                onDelete={() => onDelete(c)}
              />
            ))}
          </tbody>
        </table>
      </div>
    </>
  );
}

function CompetitorRow({
  competitor,
  onDelete,
}: {
  competitor: Competitor;
  onDelete: () => void;
}) {
  const last = competitor.last_job;
  const summaries = competitor.summaries ?? {};
  const igSummary = summaries.instagram;
  const adsSummary = summaries.facebook_ads;
  const placesSummary = summaries.google_places;
  const targetCount = competitor.targets.filter((t) => t.is_enabled && t.target_value).length;

  return (
    <tr className="transition-colors hover:bg-slate-50/60 dark:hover:bg-dk-raised/40">
      <td className="px-5 py-4">
        <Link
          href={`/competitor-analysis/${competitor.id}`}
          className="group flex items-center gap-3"
        >
          <span className="grid h-9 w-9 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
            {initials(competitor.name)}
          </span>
          <div>
            <div className="font-semibold text-slate-900 group-hover:text-blue-600 dark:text-white dark:group-hover:text-blue-400">
              {competitor.name}
            </div>
            <div className="text-xs text-slate-500 dark:text-slate-400">
              Added {formatRelative(competitor.created_at)}
            </div>
          </div>
        </Link>
      </td>
      <td className="px-5 py-4 align-middle">
        {last ? (
          last.status === 'pending' || last.status === 'running' ? (
            <JobProgress
              status={last.status}
              done={last.actors_done}
              total={last.actors_total ?? 1}
              failed={last.actors_failed}
              startedAt={last.started_at}
              finishedAt={last.finished_at}
              compact
            />
          ) : (
            <div className="flex flex-col gap-1">
              <StatusPill status={last.status} />
              <span className="text-xs text-slate-500 dark:text-slate-400">
                {last.finished_at ? formatRelative(last.finished_at) : '—'}
              </span>
            </div>
          )
        ) : (
          <StatusPill status="pending" />
        )}
      </td>
      <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200">
        <span className="font-semibold tabular-nums">{targetCount}</span>
        <span className="ml-1 text-xs text-slate-500 dark:text-slate-400">/ 6</span>
      </td>
      <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200">
        {igSummary?.followers ? (
          <div>
            <div className="font-semibold tabular-nums">{formatNumber(igSummary.followers)}</div>
            {igSummary.top_username && (
              <div className="text-xs text-slate-500 dark:text-slate-400">
                @{igSummary.top_username}
              </div>
            )}
          </div>
        ) : (
          <Empty />
        )}
      </td>
      <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200">
        {adsSummary?.ads_total ? (
          <div className="flex items-baseline gap-1.5">
            <span className="font-semibold tabular-nums">{formatNumber(adsSummary.ads_active ?? 0)}</span>
            <span className="text-xs text-slate-500 dark:text-slate-400">
              / {formatNumber(adsSummary.ads_total)}
            </span>
          </div>
        ) : (
          <Empty />
        )}
      </td>
      <td className="px-5 py-4 text-sm text-slate-700 dark:text-slate-200">
        {placesSummary?.total_reviews ? (
          <div>
            <div className="font-semibold tabular-nums">{formatNumber(placesSummary.total_reviews)}</div>
            {placesSummary.average_rating != null && (
              <div className="flex items-center gap-1 text-xs text-amber-600 dark:text-amber-400">
                <Star className="h-3 w-3 fill-current" /> {placesSummary.average_rating.toFixed(1)}
              </div>
            )}
          </div>
        ) : (
          <Empty />
        )}
      </td>
      <td className="px-5 py-4">
        <div className="flex items-center justify-end gap-2">
          <Button variant="ghost" size="icon-sm" onClick={onDelete} aria-label={`Delete ${competitor.name}`}>
            <Trash2 className="h-4 w-4 text-rose-500" />
          </Button>
          <Link
            href={`/competitor-analysis/${competitor.id}`}
            className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-2.5 py-1 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25"
            aria-label={`Open ${competitor.name}`}
          >
            Open <ChevronRight className="h-3.5 w-3.5" />
          </Link>
        </div>
      </td>
    </tr>
  );
}

function CompetitorCard({
  competitor,
  onDelete,
}: {
  competitor: Competitor;
  onDelete: () => void;
}) {
  const last = competitor.last_job;
  const summaries = competitor.summaries ?? {};
  const igSummary = summaries.instagram;
  const adsSummary = summaries.facebook_ads;
  const placesSummary = summaries.google_places;
  const targetCount = competitor.targets.filter((t) => t.is_enabled && t.target_value).length;

  return (
    <li className="rounded-xl border border-slate-200 bg-white p-4 shadow-sm dark:border-dk-border dark:bg-dk-surface">
      <Link
        href={`/competitor-analysis/${competitor.id}`}
        className="flex items-center gap-3"
      >
        <span className="grid h-10 w-10 place-items-center rounded-lg bg-gradient-to-br from-blue-500 to-violet-600 text-sm font-bold text-white">
          {initials(competitor.name)}
        </span>
        <div className="flex-1 min-w-0">
          <div className="truncate font-semibold text-slate-900 dark:text-white">
            {competitor.name}
          </div>
          <div className="text-xs text-slate-500 dark:text-slate-400">
            {targetCount}/6 targets · Added {formatRelative(competitor.created_at)}
          </div>
        </div>
        {last && <StatusPill status={last.status} />}
      </Link>

      {last && (last.status === 'pending' || last.status === 'running') && (
        <div className="mt-3">
          <JobProgress
            status={last.status}
            done={last.actors_done}
            total={last.actors_total ?? 1}
            failed={last.actors_failed}
            startedAt={last.started_at}
            finishedAt={last.finished_at}
          />
        </div>
      )}

      <dl className="mt-4 grid grid-cols-3 gap-3 text-center text-xs">
        <Stat icon={<Users className="h-3.5 w-3.5" />} label="Followers" value={igSummary?.followers} />
        <Stat icon={<Megaphone className="h-3.5 w-3.5" />} label="Active ads" value={adsSummary?.ads_active} />
        <Stat icon={<Star className="h-3.5 w-3.5" />} label="Reviews" value={placesSummary?.total_reviews} />
      </dl>

      <div className="mt-4 flex justify-end gap-2">
        <Button variant="ghost" size="sm" onClick={onDelete}>
          <Trash2 className="h-4 w-4 text-rose-500" />
          Delete
        </Button>
        <Link
          href={`/competitor-analysis/${competitor.id}`}
          className="inline-flex items-center gap-1 rounded-md bg-blue-50 px-3 py-1.5 text-xs font-semibold text-blue-700 transition-colors hover:bg-blue-100 dark:bg-blue-500/15 dark:text-blue-300 dark:hover:bg-blue-500/25"
        >
          Open <ChevronRight className="h-3.5 w-3.5" />
        </Link>
      </div>
    </li>
  );
}

function Stat({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: number | undefined;
}) {
  return (
    <div className="rounded-lg border border-slate-200 px-2 py-2 dark:border-dk-border">
      <div className="flex items-center justify-center gap-1 text-slate-500 dark:text-slate-400">
        {icon}
        <span>{label}</span>
      </div>
      <div className="mt-1 font-semibold tabular-nums text-slate-900 dark:text-white">
        {value ? formatNumber(value) : '—'}
      </div>
    </div>
  );
}

function Empty() {
  return <span className="text-slate-400 dark:text-slate-500">—</span>;
}

function initials(name: string): string {
  const parts = name.trim().split(/\s+/);
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return (parts[0][0] + parts[parts.length - 1][0]).toUpperCase();
}

function formatRelative(iso: string): string {
  const ts = Date.parse(iso);
  if (Number.isNaN(ts)) return '—';
  const diffMs = Date.now() - ts;
  const mins = Math.floor(diffMs / 60_000);
  if (mins < 1) return 'just now';
  if (mins < 60) return `${mins}m ago`;
  const hours = Math.floor(mins / 60);
  if (hours < 24) return `${hours}h ago`;
  const days = Math.floor(hours / 24);
  if (days < 30) return `${days}d ago`;
  const months = Math.floor(days / 30);
  return `${months}mo ago`;
}
