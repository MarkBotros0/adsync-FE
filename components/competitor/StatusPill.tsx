import type { CompetitorActorStatus, CompetitorJobStatus } from '@/lib/types';
import { COMPETITOR_JOB_STATUS_LABELS } from '@/lib/constants';

type Status = CompetitorJobStatus | CompetitorActorStatus;

interface StatusPillProps {
  status: Status;
  className?: string;
}

const STATUS_STYLES: Record<Status, string> = {
  pending:
    'bg-slate-100 text-slate-600 dark:bg-slate-800/60 dark:text-slate-300',
  running:
    'bg-blue-100 text-blue-700 dark:bg-blue-500/15 dark:text-blue-300 animate-pulse',
  completed:
    'bg-emerald-100 text-emerald-700 dark:bg-emerald-500/15 dark:text-emerald-300',
  partial:
    'bg-amber-100 text-amber-700 dark:bg-amber-500/15 dark:text-amber-300',
  failed:
    'bg-rose-100 text-rose-700 dark:bg-rose-500/15 dark:text-rose-300',
};

const FALLBACK_LABELS: Record<CompetitorActorStatus, string> = {
  pending: 'Pending',
  running: 'Running',
  completed: 'Done',
  failed: 'Failed',
};

export function StatusPill({ status, className = '' }: StatusPillProps) {
  const label =
    (COMPETITOR_JOB_STATUS_LABELS as Record<string, string>)[status]
    ?? FALLBACK_LABELS[status as CompetitorActorStatus]
    ?? status;

  return (
    <span
      className={`inline-flex items-center gap-1.5 rounded-full px-2.5 py-0.5 text-xs font-medium ${STATUS_STYLES[status]} ${className}`}
    >
      <span className={`h-1.5 w-1.5 rounded-full ${dotColor(status)}`} aria-hidden />
      {label}
    </span>
  );
}

function dotColor(status: Status): string {
  switch (status) {
    case 'pending':
      return 'bg-slate-400';
    case 'running':
      return 'bg-blue-500';
    case 'completed':
      return 'bg-emerald-500';
    case 'partial':
      return 'bg-amber-500';
    case 'failed':
      return 'bg-rose-500';
    default:
      return 'bg-slate-400';
  }
}
