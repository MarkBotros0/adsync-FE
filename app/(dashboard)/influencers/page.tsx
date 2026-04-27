'use client';

import { Users } from 'lucide-react';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

export default function InfluencersPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">Influencers</h1>
      </div>

      <EchofoldEmptyState
        icon={Users}
        badge="Coming Soon"
        title="Influencer Intelligence"
        description="Find the voices steering the conversation around your brand. Reach, voice share, sentiment, and performance — for every creator."
      />
    </div>
  );
}
