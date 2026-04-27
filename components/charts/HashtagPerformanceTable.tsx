'use client';

interface PostLike {
  hashtags?: string[] | null;
  reach?: number;
  interactions?: number;
}

interface HashtagPerformanceTableProps {
  posts: PostLike[];
  limit?: number;
}

interface TagRow {
  tag: string;
  uses: number;
  totalReach: number;
  totalInteractions: number;
  avgReach: number;
  avgInteractions: number;
}

/**
 * Computes per-hashtag performance from the supplied posts and renders a sortable
 * table. No backend call — operates on the same mention rows already in the
 * ContentDataContext, so it's free to render alongside the rest of /analytics.
 */
export function HashtagPerformanceTable({ posts, limit = 25 }: HashtagPerformanceTableProps) {
  const tagMap = new Map<string, TagRow>();
  for (const p of posts) {
    const tags = (p.hashtags ?? []).map((t) => t.toLowerCase());
    const reach = Number(p.reach ?? 0);
    const inter = Number(p.interactions ?? 0);
    for (const t of tags) {
      const existing = tagMap.get(t) ?? {
        tag: t, uses: 0, totalReach: 0, totalInteractions: 0,
        avgReach: 0, avgInteractions: 0,
      };
      existing.uses += 1;
      existing.totalReach += reach;
      existing.totalInteractions += inter;
      tagMap.set(t, existing);
    }
  }

  const rows = Array.from(tagMap.values())
    .map((r) => ({
      ...r,
      avgReach: r.uses ? Math.round(r.totalReach / r.uses) : 0,
      avgInteractions: r.uses ? Math.round(r.totalInteractions / r.uses) : 0,
    }))
    .sort((a, b) => b.totalInteractions - a.totalInteractions)
    .slice(0, limit);

  if (rows.length === 0) {
    return (
      <div className="rounded-lg border border-slate-200 bg-white p-6 text-center text-sm text-slate-500 dark:border-dk-border dark:bg-dk-surface">
        No hashtags found in the current window.
      </div>
    );
  }

  return (
    <div className="overflow-x-auto rounded-lg border border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface">
      <table className="w-full text-sm">
        <thead className="bg-slate-50 text-xs uppercase tracking-wider text-slate-500 dark:bg-dk-bg dark:text-purple-400">
          <tr>
            <th className="px-4 py-2 text-left">Hashtag</th>
            <th className="px-4 py-2 text-right">Uses</th>
            <th className="px-4 py-2 text-right">Total Reach</th>
            <th className="px-4 py-2 text-right">Total Interactions</th>
            <th className="px-4 py-2 text-right">Avg Reach</th>
            <th className="px-4 py-2 text-right">Avg Interactions</th>
          </tr>
        </thead>
        <tbody>
          {rows.map((r) => (
            <tr
              key={r.tag}
              className="border-t border-slate-100 text-slate-700 dark:border-dk-border dark:text-purple-100"
            >
              <td className="px-4 py-2 font-mono text-purple-600 dark:text-purple-400">{r.tag}</td>
              <td className="px-4 py-2 text-right font-mono tabular-nums">{r.uses}</td>
              <td className="px-4 py-2 text-right font-mono tabular-nums">{r.totalReach.toLocaleString()}</td>
              <td className="px-4 py-2 text-right font-mono tabular-nums">{r.totalInteractions.toLocaleString()}</td>
              <td className="px-4 py-2 text-right font-mono tabular-nums">{r.avgReach.toLocaleString()}</td>
              <td className="px-4 py-2 text-right font-mono tabular-nums">{r.avgInteractions.toLocaleString()}</td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
