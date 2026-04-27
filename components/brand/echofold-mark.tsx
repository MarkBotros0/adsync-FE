import { cn } from '@/lib/utils';
import { EchofoldLogo } from './echofold-logo';

interface EchofoldMarkProps {
  className?: string;
  variant?: 'mono' | 'duo';
  size?: 'sm' | 'md' | 'lg';
  /** Show wordmark next to the glyph. Defaults to true. */
  wordmark?: boolean;
  /** Optional small text below the wordmark, e.g. "Brand Intelligence". */
  tagline?: string;
}

const WORDMARK_TEXT_CLASSES: Record<NonNullable<EchofoldMarkProps['size']>, string> = {
  sm: 'text-sm',
  md: 'text-base',
  lg: 'text-2xl',
};

const TAGLINE_TEXT_CLASSES: Record<NonNullable<EchofoldMarkProps['size']>, string> = {
  sm: 'text-[10px]',
  md: 'text-[11px]',
  lg: 'text-xs',
};

export function EchofoldMark({
  className,
  variant = 'mono',
  size = 'md',
  wordmark = true,
  tagline,
}: EchofoldMarkProps) {
  return (
    <span className={cn('inline-flex items-center gap-2.5', className)}>
      <span
        className={cn(
          'grid place-items-center rounded-xl',
          size === 'sm' && 'h-7 w-7',
          size === 'md' && 'h-9 w-9',
          size === 'lg' && 'h-14 w-14',
          'bg-gradient-to-br from-purple-600 to-indigo-600 text-white shadow-md shadow-purple-900/30',
        )}
      >
        <EchofoldLogo variant={variant} size={size === 'lg' ? 'lg' : size === 'md' ? 'md' : 'sm'} />
      </span>
      {wordmark && (
        <span className="flex flex-col leading-none">
          <span className={cn('font-bold tracking-tight', WORDMARK_TEXT_CLASSES[size])}>
            Echofold
          </span>
          {tagline && (
            <span className={cn('mt-1 uppercase tracking-[0.18em] text-current/60', TAGLINE_TEXT_CLASSES[size])}>
              {tagline}
            </span>
          )}
        </span>
      )}
    </span>
  );
}
