'use client';

import { useState } from 'react';
import {
  PieChart,
  Pie,
  Cell,
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
} from 'recharts';
import { useTheme } from '@/contexts/theme-context';
import type { PostInsights } from '@/lib/types';

// ─── Types ────────────────────────────────────────────────────────────────────

interface PostInsightsPanelProps {
  insights: PostInsights;
}

type DemoTab = 'age' | 'countries';

// ─── Helpers ──────────────────────────────────────────────────────────────────

function fmtN(n: number): string {
  if (n >= 1_000_000) return (n / 1_000_000).toFixed(1) + 'M';
  if (n >= 1_000) return (n / 1_000).toFixed(1) + 'K';
  return String(n);
}

function fmtSec(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = Math.round(sec % 60);
  return m > 0 ? `${m}:${String(s).padStart(2, '0')}` : `0:${String(s).padStart(2, '0')}`;
}

// ─── Sub-sections ─────────────────────────────────────────────────────────────

function ViewsSection({
  insights,
  isDark,
}: {
  insights: PostInsights;
  isDark: boolean;
}) {
  const total = insights.views ?? 0;
  const followersPct = insights.followers_pct;
  const nonFollowersPct = insights.non_followers_pct;
  const hasBreakdown = followersPct != null && nonFollowersPct != null;

  const COLORS = ['#3b82f6', '#1e3a5f'];
  const tooltipStyle = isDark
    ? { fontSize: 11, borderRadius: 6, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 11, borderRadius: 6 };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase tracking-wide">
        Views
      </h4>
      <div className="flex items-center gap-4">
        <div className="text-2xl font-bold text-slate-900 dark:text-purple-100">{fmtN(total)}</div>
        {hasBreakdown && (
          <>
            <PieChart width={90} height={90}>
              <Pie
                data={[
                  { name: 'Non-followers', value: Math.round(nonFollowersPct!) },
                  { name: 'Followers', value: Math.round(followersPct!) },
                ]}
                cx={40}
                cy={40}
                innerRadius={26}
                outerRadius={40}
                startAngle={90}
                endAngle={-270}
                dataKey="value"
                strokeWidth={0}
              >
                {[0, 1].map(i => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [`${v ?? 0}%`]} />
            </PieChart>
            <div className="flex flex-col gap-1 text-xs">
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-400" />
                <span className="text-slate-500 dark:text-purple-400">Non-followers</span>
                <span className="font-semibold text-slate-700 dark:text-purple-200 ml-auto pl-2">
                  {nonFollowersPct!.toFixed(1)}%
                </span>
              </div>
              <div className="flex items-center gap-1.5">
                <span className="inline-block h-2 w-2 rounded-full bg-blue-900" />
                <span className="text-slate-500 dark:text-purple-400">Followers</span>
                <span className="font-semibold text-slate-700 dark:text-purple-200 ml-auto pl-2">
                  {followersPct!.toFixed(1)}%
                </span>
              </div>
              {insights.reach != null && (
                <div className="mt-1 pt-1 border-t border-slate-100 dark:border-dk-border text-slate-500 dark:text-purple-500">
                  Viewers: <span className="font-semibold text-slate-700 dark:text-purple-200">{fmtN(insights.reach)}</span>
                </div>
              )}
            </div>
          </>
        )}
        {!hasBreakdown && insights.reach != null && (
          <div className="text-xs text-slate-500 dark:text-purple-400">
            Reach: <span className="font-semibold text-slate-700 dark:text-purple-200">{fmtN(insights.reach)}</span>
          </div>
        )}
      </div>
    </div>
  );
}

function NetFollowsSection({ netFollows }: { netFollows: number }) {
  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase tracking-wide">
        Net Follows
      </h4>
      <div className="flex flex-col items-start">
        <span className="text-2xl font-bold text-slate-900 dark:text-purple-100">{netFollows}</span>
        <span className="text-xs text-slate-400 dark:text-purple-500">Net follows</span>
      </div>
    </div>
  );
}

function RetentionSection({ insights }: { insights: PostInsights }) {
  const avgSec = insights.avg_watch_time_sec ?? 0;
  if (avgSec === 0 && insights.three_sec_views == null && insights.one_min_views == null) return null;

  const totalWatchSec = insights.total_watch_time_sec;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase tracking-wide">
        Audience Retention
      </h4>
      {avgSec > 0 && (
        <div className="text-center mb-1">
          <div className="text-xl font-bold text-slate-900 dark:text-purple-100">{fmtSec(avgSec)}</div>
          <div className="text-xs text-slate-400 dark:text-purple-500">Average watch time</div>
        </div>
      )}
      <div className="grid grid-cols-3 gap-2 text-center text-xs">
        {insights.three_sec_views != null && (
          <div>
            <div className="font-semibold text-slate-800 dark:text-purple-200">{insights.three_sec_views}</div>
            <div className="text-slate-400 dark:text-purple-500">3-sec views</div>
          </div>
        )}
        {insights.one_min_views != null && (
          <div>
            <div className="font-semibold text-slate-800 dark:text-purple-200">{insights.one_min_views}</div>
            <div className="text-slate-400 dark:text-purple-500">1-min views</div>
          </div>
        )}
        {totalWatchSec != null && totalWatchSec > 0 && (
          <div>
            <div className="font-semibold text-slate-800 dark:text-purple-200">{fmtSec(totalWatchSec)}</div>
            <div className="text-slate-400 dark:text-purple-500">Watch time</div>
          </div>
        )}
      </div>
    </div>
  );
}

function TrafficSection({
  sources,
  isDark,
}: {
  sources: PostInsights['traffic_sources'];
  isDark: boolean;
}) {
  if (!sources || sources.length === 0) return null;

  const tooltipStyle = isDark
    ? { fontSize: 11, borderRadius: 6, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 11, borderRadius: 6 };

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase tracking-wide">
        How People Find Your Content
      </h4>
      <div className="space-y-2">
        {sources.map(s => (
          <div key={s.source} className="flex items-center gap-2">
            <span className="text-xs text-slate-600 dark:text-purple-300 w-24 shrink-0 truncate">{s.source}</span>
            <div className="flex-1 h-4 bg-slate-100 dark:bg-dk-raised rounded overflow-hidden">
              <div
                className="h-full bg-blue-500 rounded"
                style={{ width: `${s.percentage}%` }}
              />
            </div>
            <span className="text-xs font-semibold text-slate-700 dark:text-purple-200 w-12 text-right">
              {s.percentage.toFixed(1)}%
            </span>
          </div>
        ))}
      </div>
    </div>
  );
}

function EngagementSection({
  insights,
  isDark,
}: {
  insights: PostInsights;
  isDark: boolean;
}) {
  const data = [
    { label: 'Likes', value: insights.likes },
    { label: 'Comments', value: insights.comments },
    { label: 'Shares', value: insights.shares },
    ...(insights.saves != null ? [{ label: 'Saves', value: insights.saves }] : []),
  ];

  const gridStroke = isDark ? '#251043' : '#f1f5f9';
  const tooltipStyle = isDark
    ? { fontSize: 11, borderRadius: 6, border: '1px solid #3b1f6a', background: '#1a0a2e', color: '#e9d5ff' }
    : { fontSize: 11, borderRadius: 6 };

  const allZero = data.every(d => d.value === 0);

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase tracking-wide">
        Interactions
      </h4>
      <div className="text-center">
        <div className="text-2xl font-bold text-slate-900 dark:text-purple-100">{fmtN(insights.total_interactions)}</div>
        <div className="text-xs text-slate-400 dark:text-purple-500">Total interactions</div>
      </div>
      {!allZero && (
        <ResponsiveContainer width="100%" height={90}>
          <BarChart data={data} margin={{ top: 4, right: 4, left: -25, bottom: 0 }}>
            <CartesianGrid strokeDasharray="3 3" stroke={gridStroke} />
            <XAxis dataKey="label" tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <YAxis tick={{ fontSize: 10, fill: '#94a3b8' }} axisLine={false} tickLine={false} />
            <Tooltip contentStyle={tooltipStyle} formatter={(v: number | undefined) => [fmtN(v ?? 0)]} />
            <Bar dataKey="value" fill="#7c3aed" radius={[3, 3, 0, 0]} maxBarSize={40} />
          </BarChart>
        </ResponsiveContainer>
      )}
    </div>
  );
}

function DemographicsSection({
  insights,
  isDark,
}: {
  insights: PostInsights;
  isDark: boolean;
}) {
  const [tab, setTab] = useState<DemoTab>('age');
  const hasAge = insights.age_gender && insights.age_gender.length > 0;
  const hasCountries = insights.countries && insights.countries.length > 0;

  if (!hasAge && !hasCountries) return null;

  const maxPct = insights.age_gender ? Math.max(...insights.age_gender.map(a => a.total_pct)) : 1;

  return (
    <div className="flex flex-col gap-2">
      <h4 className="text-xs font-semibold text-slate-500 dark:text-purple-400 uppercase tracking-wide">
        Who Viewed Your Content
      </h4>

      {hasAge && hasCountries && (
        <div className="flex gap-1 mb-1">
          <button
            onClick={() => setTab('age')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              tab === 'age'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-slate-200 dark:border-dk-border text-slate-500 dark:text-purple-400 hover:border-blue-400'
            }`}
          >
            Age &amp; gender
          </button>
          <button
            onClick={() => setTab('countries')}
            className={`text-xs px-3 py-1 rounded-full border transition-colors ${
              tab === 'countries'
                ? 'bg-blue-500 border-blue-500 text-white'
                : 'border-slate-200 dark:border-dk-border text-slate-500 dark:text-purple-400 hover:border-blue-400'
            }`}
          >
            Top countries
          </button>
        </div>
      )}

      {(tab === 'age' || !hasCountries) && hasAge && (
        <div className="space-y-1.5">
          <div className="flex items-center gap-2 text-[10px] text-slate-400 dark:text-purple-500 mb-1">
            <span className="h-2 w-2 rounded-full bg-blue-400 inline-block" /> Women
            <span className="h-2 w-2 rounded-full bg-blue-800 inline-block ml-1" /> Men
          </div>
          {insights.age_gender!.map(ag => (
            <div key={ag.age_range} className="flex items-center gap-2">
              <span className="text-xs text-slate-600 dark:text-purple-300 w-12 shrink-0">{ag.age_range}</span>
              <div className="flex-1 flex gap-0.5 h-3 rounded overflow-hidden bg-slate-100 dark:bg-dk-raised">
                <div
                  className="h-full bg-blue-400"
                  style={{ width: `${(ag.women_pct / maxPct) * 100 * 0.5}%` }}
                />
                <div
                  className="h-full bg-blue-800"
                  style={{ width: `${(ag.men_pct / maxPct) * 100 * 0.5}%` }}
                />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-purple-200 w-12 text-right">
                {ag.total_pct.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}

      {(tab === 'countries' || !hasAge) && hasCountries && (
        <div className="space-y-1.5">
          {insights.countries!.map((c, i) => (
            <div key={c.country} className="flex items-center gap-2">
              <span className="text-xs text-slate-500 dark:text-purple-500 w-4">{i + 1}.</span>
              {c.flag && <span className="text-base">{c.flag}</span>}
              <span className="text-xs text-slate-600 dark:text-purple-300 flex-1 truncate">{c.country}</span>
              <div className="w-20 h-2 bg-slate-100 dark:bg-dk-raised rounded overflow-hidden">
                <div className="h-full bg-blue-500 rounded" style={{ width: `${c.percentage}%` }} />
              </div>
              <span className="text-xs font-semibold text-slate-700 dark:text-purple-200 w-10 text-right">
                {c.percentage.toFixed(1)}%
              </span>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}

// ─── Component ────────────────────────────────────────────────────────────────

export function PostInsightsPanel({ insights }: PostInsightsPanelProps) {
  const { theme } = useTheme();
  const isDark = theme === 'dark';

  const hasViews = insights.views > 0 || insights.followers_pct != null;
  const hasRetention = (insights.avg_watch_time_sec ?? 0) > 0 || insights.three_sec_views != null;
  const hasTraffic = (insights.traffic_sources ?? []).length > 0;

  return (
    <div className="border-t border-slate-100 dark:border-dk-border bg-slate-50/60 dark:bg-dk-raised/40 px-5 py-4">
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-x-6 gap-y-5">
        {/* Views + Net follows */}
        <div className="flex flex-col gap-5">
          {hasViews && <ViewsSection insights={insights} isDark={isDark} />}
          <NetFollowsSection netFollows={insights.net_follows ?? 0} />
        </div>

        {/* Audience retention */}
        {hasRetention && (
          <div>
            <RetentionSection insights={insights} />
          </div>
        )}

        {/* Engagement */}
        <div className="flex flex-col gap-5">
          <EngagementSection insights={insights} isDark={isDark} />
          {hasTraffic && <TrafficSection sources={insights.traffic_sources} isDark={isDark} />}
        </div>

        {/* Demographics — full width if it spans */}
        <div className={hasRetention ? 'sm:col-span-2 lg:col-span-3' : 'sm:col-span-2 lg:col-span-2'}>
          <DemographicsSection insights={insights} isDark={isDark} />
        </div>
      </div>
    </div>
  );
}
