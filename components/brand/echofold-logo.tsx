import { cn } from '@/lib/utils';

interface EchofoldLogoProps {
  className?: string;
  variant?: 'mono' | 'duo';
  size?: 'sm' | 'md' | 'lg';
  title?: string;
}

const SIZE_PX: Record<NonNullable<EchofoldLogoProps['size']>, number> = {
  sm: 20,
  md: 28,
  lg: 56,
};

export function EchofoldLogo({
  className,
  variant = 'mono',
  size = 'md',
  title = 'Echofold',
}: EchofoldLogoProps) {
  const px = SIZE_PX[size];

  return (
    <svg
      role="img"
      aria-label={title}
      viewBox="0 0 32 32"
      width={px}
      height={px}
      fill="none"
      xmlns="http://www.w3.org/2000/svg"
      className={cn('shrink-0', className)}
    >
      <title>{title}</title>
      {/* Outer arc — the larger, "older" echo */}
      <path
        d="M22 5.5A12 12 0 1 0 22 26.5"
        stroke="currentColor"
        strokeWidth="2.6"
        strokeLinecap="round"
      />
      {/* Inner arc — the closer, "newer" echo. In duo variant, accent. */}
      <path
        d="M19 11A6 6 0 1 0 19 21"
        stroke={variant === 'duo' ? 'var(--ef-signal, #06B6D4)' : 'currentColor'}
        strokeWidth="2.6"
        strokeLinecap="round"
        opacity={variant === 'duo' ? 1 : 0.55}
      />
      {/* Center node — the source / focal point */}
      <circle cx="16" cy="16" r="1.6" fill="currentColor" />
    </svg>
  );
}
