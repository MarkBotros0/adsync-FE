'use client';

import { Download, Sparkles } from 'lucide-react';
import type { TopCountry } from '@/lib/types';

export function TopCountriesChart({ data }: { data?: TopCountry[] }) {
  return (
    <div className="bg-white rounded-xl border border-slate-200 overflow-hidden">
      <div className="flex items-center justify-between px-5 py-4 border-b border-slate-100">
        <div>
          <h3 className="text-sm font-semibold text-slate-800">Top Countries</h3>
          <p className="text-xs text-slate-400"># of mentions by country</p>
        </div>
        <div className="flex items-center gap-2">
          <button className="flex items-center gap-1.5 text-xs text-purple-600 hover:text-purple-800 font-medium border border-purple-200 px-2.5 py-1 rounded-lg transition-colors">
            <Sparkles className="h-3 w-3" />
            Run AI Analysis
          </button>
          <button className="text-slate-400 hover:text-slate-600">
            <Download className="h-4 w-4" />
          </button>
        </div>
      </div>

      {!data || data.length === 0 ? (
        <div className="flex items-center justify-center py-16 text-slate-400 text-sm">
          Country data is not available from the Facebook API
        </div>
      ) : (
        <div className="p-5 space-y-3">
          {data.map((c, i) => {
            const max = data[0]?.count ?? 1;
            return (
              <div key={c.country} className="flex items-center gap-3">
                <span className="text-xs font-medium text-slate-500 w-4">{i + 1}.</span>
                {c.flag && <span className="text-lg">{c.flag}</span>}
                <div className="flex-1 min-w-0">
                  <div className="flex items-center justify-between mb-1">
                    <span className="text-sm text-slate-700 font-medium">{c.country}</span>
                    <span className="text-sm font-semibold text-slate-900">{c.count}</span>
                  </div>
                  <div className="h-1.5 bg-slate-100 rounded-full overflow-hidden">
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
