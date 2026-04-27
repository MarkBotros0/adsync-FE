'use client';

import { Sparkles } from 'lucide-react';
import { EchofoldEmptyState } from '@/components/brand/echofold-empty-state';

export default function AIDigestPage() {
  return (
    <div className="flex flex-col h-full">
      <div className="bg-white dark:bg-dk-surface border-b border-slate-200 dark:border-dk-border px-6 py-4">
        <h1 className="text-base font-bold text-slate-900 dark:text-purple-100">AI Digest</h1>
      </div>

      <EchofoldEmptyState
        icon={Sparkles}
        badge="Coming Soon"
        title="AI-powered Digest"
        description="Wake up to a written brief on what changed overnight. Echofold summarises the chatter, surfaces emerging themes, and tells you where to look first."
      />
    </div>
  );
}
