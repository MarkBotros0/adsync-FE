'use client';

import { Users } from 'lucide-react';

export default function InfluencersPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-base font-bold text-slate-900">Influencers</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-purple-50 flex items-center justify-center mb-4">
          <Users className="h-8 w-8 text-purple-400" />
        </div>
        <span className="text-xs font-semibold bg-purple-100 text-purple-600 px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
          Coming Soon
        </span>
        <h3 className="text-base font-semibold text-slate-800 mb-2">Influencer Detection</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Identify and track influencers mentioning your brand across platforms, with reach and sentiment analysis.
        </p>
      </div>
    </div>
  );
}
