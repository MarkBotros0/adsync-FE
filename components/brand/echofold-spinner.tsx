import { cn } from '@/lib/utils';

interface EchofoldSpinnerProps {
  size?: 'sm' | 'md' | 'lg';
  label?: string;
  className?: string;
}

const SIZE_PX: Record<NonNullable<EchofoldSpinnerProps['size']>, number> = {
  sm: 24,
  md: 40,
  lg: 64,
};

export function EchofoldSpinner({ size = 'md', label, className }: EchofoldSpinnerProps) {
  const px = SIZE_PX[size];

  return (
    <div className={cn('inline-flex flex-col items-center gap-3', className)}>
      <span
        role="status"
        aria-label={label ?? 'Loading'}
        className="ef-echo-pulse rounded-full"
        style={{ width: px, height: px }}
      >
        <span
          className="grid place-items-center rounded-full bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30"
          style={{ width: px, height: px }}
        >
          <svg viewBox="0 0 32 32" width={Math.round(px * 0.55)} height={Math.round(px * 0.55)} fill="none" aria-hidden>
            <path d="M22 5.5A12 12 0 1 0 22 26.5" stroke="currentColor" strokeWidth="2.6" strokeLinecap="round" />
            <path d="M19 11A6 6 0 1 0 19 21" stroke="var(--ef-signal, #06B6D4)" strokeWidth="2.6" strokeLinecap="round" />
            <circle cx="16" cy="16" r="1.6" fill="currentColor" />
          </svg>
        </span>
      </span>
      {label && (
        <span className="text-xs font-medium text-slate-500 dark:text-purple-400">{label}</span>
      )}
    </div>
  );
}
