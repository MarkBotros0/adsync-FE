'use client';

import type { PostGrade } from '@/lib/types';
import { cn } from '@/lib/utils';

interface GradeBadgeProps {
  grade: PostGrade | null | undefined;
  size?: 'sm' | 'md';
  className?: string;
}

const GRADE_STYLES: Record<PostGrade, string> = {
  'A+': 'bg-emerald-100 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/15 dark:text-emerald-300 dark:ring-emerald-500/30',
  'A': 'bg-emerald-50 text-emerald-700 ring-emerald-200 dark:bg-emerald-500/10 dark:text-emerald-300 dark:ring-emerald-500/20',
  'B': 'bg-cyan-50 text-cyan-700 ring-cyan-200 dark:bg-cyan-500/10 dark:text-cyan-300 dark:ring-cyan-500/20',
  'C': 'bg-amber-50 text-amber-700 ring-amber-200 dark:bg-amber-500/10 dark:text-amber-300 dark:ring-amber-500/20',
  'D': 'bg-slate-100 text-slate-600 ring-slate-200 dark:bg-slate-500/15 dark:text-slate-300 dark:ring-slate-500/30',
};

/**
 * Renders the marketing-expert spec's quartile-rank Grade (A+ / A / B / C / D)
 * for a single post. Pairs with the `weighted_score` shown on the Content row.
 */
export function GradeBadge({ grade, size = 'md', className }: GradeBadgeProps) {
  if (!grade) {
    return (
      <span
        className={cn(
          'inline-flex items-center justify-center rounded-md px-1.5 text-xs font-semibold text-slate-400 ring-1 ring-slate-200 dark:text-slate-500 dark:ring-slate-700',
          size === 'sm' ? 'h-5 w-5' : 'h-6 min-w-6',
          className,
        )}
        title="Not enough data to grade this post"
      >
        —
      </span>
    );
  }
  return (
    <span
      className={cn(
        'inline-flex items-center justify-center rounded-md font-mono font-bold ring-1',
        size === 'sm' ? 'h-5 px-1.5 text-[11px]' : 'h-6 px-2 text-xs',
        GRADE_STYLES[grade],
        className,
      )}
      title={`Grade ${grade} (top quartile by weighted score)`}
    >
      {grade}
    </span>
  );
}
