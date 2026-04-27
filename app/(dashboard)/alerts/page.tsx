'use client';

import { Bell } from 'lucide-react';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

export default function AlertsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Alerts</h1>
      </div>

      <EchofoldEmptyState
        icon={Bell}
        badge="Coming Soon"
        title="Real-time Alerts"
        description="Get notified the moment a wave starts forming — negative spikes, mention surges, and competitor moves, routed straight to your inbox or Slack."
      />
    </div>
  );
}
