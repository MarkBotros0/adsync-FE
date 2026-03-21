'use client';

import type { TopCountry } from '@/lib/types';

export function TopCountriesChart({ data }: { data?: TopCountry[] }) {
  return (
    <div className="bg-white dark:bg-dk-surface rounded-xl border border-slate-200 dark:border-dk-border overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100 dark:border-dk-border">
        <div>
          <h3 className="text-sm font-semibold text-slate-800 dark:text-purple-100">Top Countries</h3>
          <p className="text-xs text-slate-400 dark:text-purple-500"># of mentions by country</p>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-400 dark:text-purple-500 text-sm">
          Country data is not available from the Facebook API
        </div>
      ) : (
        <div className="p-5 space-y-3">
          {data.map((c, i) => {
            const max = data[0]?.count ?? 1;
            return (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 dark:text-purple-400 w-4">{i + 1}.</span>
                {c.flag && <span className="text-lg">{c.flag}</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 dark:text-purple-200 font-medium">{c.country}</span>
                    <span className="text-sm font-semibold text-slate-900 dark:text-purple-100">{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 dark:bg-dk-raised rounded-full overflow-hidden">
                    <div
                      className="h-full bg-purple-500 rounded-full"
                      style={{ width: `${(c.count / max) * 100}%` }}
                    />
                  </div>
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}
