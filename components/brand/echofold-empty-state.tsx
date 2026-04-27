import type { ComponentType, SVGProps, ReactNode } from 'react';
import { cn } from '@/lib/utils';

interface EchofoldEmptyStateProps {
  icon?: ComponentType<SVGProps<SVGSVGElement>>;
  badge?: string;
  title: string;
  description: string;
  action?: ReactNode;
  className?: string;
}

export function EchofoldEmptyState({
  icon: Icon,
  badge,
  title,
  description,
  action,
  className,
}: EchofoldEmptyStateProps) {
  return (
    <div
      className={cn(
        'flex flex-1 flex-col items-center justify-center px-6 py-16 text-center',
        'bg-slate-50 dark:bg-dk-bg',
        className,
      )}
    >
      {/* Concentric arcs visual — the brand mark exploded into a backdrop */}
      <div className="relative mb-8 flex h-32 w-32 items-center justify-center">
        {/* Three concentric arcs, increasing radius, decreasing opacity */}
        <svg
          aria-hidden
          viewBox="0 0 128 128"
          className="absolute inset-0 h-full w-full text-purple-300 dark:text-purple-400"
          fill="none"
        >
          <circle cx="64" cy="64" r="60" stroke="currentColor" strokeOpacity="0.12" strokeWidth="1.5" />
          <circle cx="64" cy="64" r="44" stroke="currentColor" strokeOpacity="0.22" strokeWidth="1.5" />
          <circle cx="64" cy="64" r="28" stroke="currentColor" strokeOpacity="0.34" strokeWidth="1.5" />
        </svg>

        {/* Center icon disc */}
        <div className="relative grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-lg shadow-purple-900/30">
          {Icon ? <Icon className="h-6 w-6" /> : (
            <svg viewBox="0 0 32 32" className="h-6 w-6" fill="none" aria-hidden>
              <path d="M22 5.5A12 12 0 1 0 22 26.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
              <path d="M19 11A6 6 0 1 0 19 21" stroke="var(--ef-signal, #06B6D4)" strokeWidth="2.6" strokeLinecap="round" />
              <circle cx="16" cy="16" r="1.6" fill="currentColor" />
            </svg>
          )}
        </div>
      </div>

      {badge && (
        <span className="mb-3 rounded-full bg-purple-100 px-2.5 py-1 text-xs font-semibold uppercase tracking-wide text-purple-600 dark:bg-purple-900/60 dark:text-purple-300">
          {badge}
        </span>
      )}

      <h3 className="mb-2 text-base font-semibold text-slate-800 dark:text-purple-100">
        {title}
      </h3>
      <p className="max-w-sm text-sm text-slate-500 dark:text-purple-400">
        {description}
      </p>

      {action && <div className="mt-6">{action}</div>}
    </div>
  );
}
