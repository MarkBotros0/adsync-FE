'use client';

import { Bell } from 'lucide-react';

export default function AlertsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Alerts</h1>
      </div>

      <div className="flex-1 flex flex-col items-center justify-center p-6 text-center bg-slate-50 dark:bg-dk-bg">
        <div className="h-16 w-16 rounded-full bg-purple-50 dark:bg-purple-900/40 flex items-center justify-center mb-4">
          <Bell className="h-8 w-8 text-purple-400" />
        </div>
        <span className="text-xs font-semibold bg-purple-100 dark:bg-purple-900/60 text-purple-600 dark:text-purple-300 px-2.5 py-1 rounded-full uppercase tracking-wide mb-3">
          Coming Soon
        </span>
        <h3 className="text-base font-semibold text-slate-800 dark:text-purple-100 mb-2">Real-time Alerts</h3>
        <p className="text-sm text-slate-500 dark:text-purple-400 max-w-xs">
          Get notified instantly when your brand is mentioned, sentiment spikes, or keywords are detected across platforms.
        </p>
      </div>
    </div>
  );
}
