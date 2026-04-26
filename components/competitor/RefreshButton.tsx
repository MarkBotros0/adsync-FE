'use client';

import { RefreshCw } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import type { CompetitorJobStatus } from '@/lib/types';

interface RefreshButtonProps {
  status: CompetitorJobStatus | null;
  onRefresh: () => void;
  loading?: boolean;
  size?: 'sm' | 'default';
  label?: string;
}

export function RefreshButton({
  status,
  onRefresh,
  loading = false,
  size = 'sm',
  label,
}: RefreshButtonProps) {
  const isActive = status === 'pending' || status === 'running';
  const disabled = loading || isActive;

  return (
    <Button
      variant="outline"
      size={size}
      onClick={onRefresh}
      disabled={disabled}
      aria-busy={isActive || loading}
      title={isActive ? 'A scrape is already running' : 'Run a fresh scrape'}
    >
      <RefreshCw className={`h-4 w-4 ${isActive || loading ? 'animate-spin' : ''}`} />
      {label ?? (isActive ? 'Scraping…' : 'Refresh')}
    </Button>
  );
}
