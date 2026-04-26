'use client';

import { useCallback, useState } from 'react';
import { Loader2, Play, RotateCw } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { competitorAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import {
  CostConfirmDialog,
  shouldSkipCostDialog,
} from './CostConfirmDialog';
import type {
  BrandUsage,
  CompetitorActorKey,
  CompetitorActorStatus,
  EstimatedCost,
} from '@/lib/types';

interface RunActorButtonProps {
  competitorId: number;
  actorKey: CompetitorActorKey;
  status: CompetitorActorStatus;
  /** Whether the user has configured a target value for this actor. */
  hasTarget: boolean;
  /** Last-run cost for this target — surfaced in the confirm dialog. */
  lastCostUsd: number | null;
  usage: BrandUsage | null;
  onStarted?: () => Promise<void> | void;
  size?: 'sm' | 'default';
  variant?: 'default' | 'outline';
}

export function RunActorButton({
  competitorId,
  actorKey,
  status,
  hasTarget,
  lastCostUsd,
  usage,
  onStarted,
  size = 'sm',
  variant = 'default',
}: RunActorButtonProps) {
  const { token } = useBrandAuthContext();
  const [dialogOpen, setDialogOpen] = useState(false);
  const [estimate, setEstimate] = useState<EstimatedCost | null>(null);
  const [estimateLoading, setEstimateLoading] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const isRunning = status === 'pending' || status === 'running';
  const blocking = !!usage?.budget.will_block;

  const start = useCallback(async () => {
    if (!token) return;
    setSubmitting(true);
    try {
      await competitorAPI.runActor(token, competitorId, actorKey);
      toast.success('Run queued — results will appear shortly.');
      if (onStarted) await onStarted();
      setDialogOpen(false);
    } catch (err) {
      const message = extractMessage(err);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  }, [token, competitorId, actorKey, onStarted]);

  const openDialog = useCallback(async () => {
    if (!token || !hasTarget || isRunning) return;

    if (shouldSkipCostDialog()) {
      await start();
      return;
    }

    setDialogOpen(true);
    setEstimateLoading(true);
    try {
      const res = await competitorAPI.estimateActor(token, competitorId, actorKey);
      setEstimate(res.data.data);
    } catch {
      setEstimate(null);
    } finally {
      setEstimateLoading(false);
    }
  }, [token, competitorId, actorKey, hasTarget, isRunning, start]);

  const Icon = status === 'completed' || status === 'failed' ? RotateCw : Play;
  const label =
    status === 'running'
      ? 'Running…'
      : status === 'pending'
        ? 'Queued…'
        : status === 'completed'
          ? 'Re-run'
          : status === 'failed'
            ? 'Retry'
            : 'Run scraper';

  const disabled = !hasTarget || isRunning || submitting || blocking;

  return (
    <>
      <Button
        size={size}
        variant={variant}
        onClick={() => void openDialog()}
        disabled={disabled}
        title={
          !hasTarget
            ? 'Configure a target for this scraper first.'
            : blocking
              ? 'Compute-unit budget exceeded for this organization.'
              : undefined
        }
        className="inline-flex items-center gap-1.5"
      >
        {isRunning || submitting ? (
          <Loader2 className="h-4 w-4 animate-spin" />
        ) : (
          <Icon className="h-4 w-4" />
        )}
        <span>{label}</span>
      </Button>

      <CostConfirmDialog
        open={dialogOpen}
        actorKey={actorKey}
        estimate={estimate}
        estimateLoading={estimateLoading}
        lastActualUsd={lastCostUsd}
        budget={usage}
        submitting={submitting}
        onConfirm={start}
        onCancel={() => setDialogOpen(false)}
      />
    </>
  );
}

function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = (err as { response?: { data?: { detail?: string | { message?: string }; message?: string } } }).response;
    const detail = res?.data?.detail;
    if (typeof detail === 'string') return detail;
    if (detail && typeof detail === 'object' && detail.message) return String(detail.message);
    if (res?.data?.message) return res.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Failed to run scraper';
}
