'use client';

import { FileText } from 'lucide-react';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

export default function ReportsPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Reports</h1>
      </div>

      <EchofoldEmptyState
        icon={FileText}
        badge="Coming Soon"
        title="Reports & Exports"
        description="Branded, shareable reports — PDF or live link — for clients, leadership, and weekly stand-ups. Built for agencies that need to show their work."
      />
    </div>
  );
}
