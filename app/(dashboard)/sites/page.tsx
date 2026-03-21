'use client';

import { Globe } from 'lucide-react';

export default function SitesPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white border-b border-slate-200 px-6 py-4">
        <h1 className="text-base font-bold text-slate-900">Sites</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center">
        <div className="h-16 w-16 rounded-full bg-teal-50 flex items-center justify-center mb-4">
          <Globe className="h-8 w-8 text-teal-400" />
        </div>
        <span className="text-xs font-semibold bg-teal-100 text-teal-600 px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
          Coming Soon
        </span>
        <h3 className="text-base font-semibold text-slate-800 mb-2">Web Monitoring</h3>
        <p className="text-sm text-slate-500 max-w-xs">
          Track any website or blog for mentions of your brand and get notified when new content is published.
        </p>
      </div>
    </div>
  );
}
