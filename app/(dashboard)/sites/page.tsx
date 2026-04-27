'use client';

import { Globe } from 'lucide-react';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

export default function SitesPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Sites</h1>
      </div>

      <EchofoldEmptyState
        icon={Globe}
        badge="Coming Soon"
        title="Web Monitoring"
        description="Track any website, blog, or news source for mentions of your brand. Echofold catches the echo before it hits social."
      />
    </div>
  );
}
