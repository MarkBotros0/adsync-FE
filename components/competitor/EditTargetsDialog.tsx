'use client';

import { useEffect, useMemo, useRef, useState } from 'react';
import { Loader2, X } from 'lucide-react';
import { toast } from 'sonner';
import { Button } from '@/components/ui/Button';
import { competitorAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { COMPETITOR_ACTOR_KEYS } from '@/lib/constants';
import type {
  CompetitorActorKey,
  CompetitorTarget,
  CompetitorTargetType,
} from '@/lib/types';
import {
  CompetitorTargetForm,
  buildTargetInputs,
  type TargetMap,
} from './CompetitorTargetForm';

interface EditTargetsDialogProps {
  open: boolean;
  competitorId: number;
  competitorName: string;
  initialTargets: CompetitorTarget[];
  onOpenChange: (open: boolean) => void;
  onSaved: (targets: CompetitorTarget[]) => void;
}

export function EditTargetsDialog({
  open,
  competitorId,
  competitorName,
  initialTargets,
  onOpenChange,
  onSaved,
}: EditTargetsDialogProps) {
  const { token } = useBrandAuthContext();
  const [values, setValues] = useState<TargetMap>({});
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const seededRef = useRef(false);

  // Seed once per open cycle. Parent polling rebuilds `initialTargets` every
  // tick, so we can't put it in deps — that would wipe in-progress edits.
  useEffect(() => {
    if (!open) {
      seededRef.current = false;
      return;
    }
    if (seededRef.current) return;
    seededRef.current = true;
    const seeded: TargetMap = {};
    for (const t of initialTargets) {
      seeded[t.actor_key] = t.target_value;
    }
    setValues(seeded);
    setError(null);
  }, [open, initialTargets]);

  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onOpenChange(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, submitting, onOpenChange]);

  const targetInputs = useMemo(
    () => buildTargetInputs(values, competitorName),
    [values, competitorName],
  );

  if (!open) return null;

  const handleChange = (key: CompetitorActorKey, value: string) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const handleSave = async () => {
    if (!token) return;
    setSubmitting(true);
    setError(null);
    try {
      const existingByKey = new Map(initialTargets.map((t) => [t.actor_key, t]));
      const desiredByKey = new Map(targetInputs.map((t) => [t.actor_key, t]));

      // Upserts.
      const updated: CompetitorTarget[] = [];
      for (const [actorKey, input] of desiredByKey.entries()) {
        const res = await competitorAPI.upsertTarget(token, competitorId, actorKey, input);
        updated.push(res.data.data);
      }
      // Deletions for cleared inputs.
      for (const actorKey of COMPETITOR_ACTOR_KEYS) {
        if (existingByKey.has(actorKey) && !desiredByKey.has(actorKey)) {
          await competitorAPI.deleteTarget(token, competitorId, actorKey);
        }
      }
      onSaved(updated);
      toast.success('Targets updated');
      onOpenChange(false);
    } catch (err) {
      const message = extractMessage(err);
      setError(message);
      toast.error(message);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-end justify-center sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="edit-targets-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => !submitting && onOpenChange(false)}
        aria-hidden
      />
      <div className="relative max-h-[90vh] w-full max-w-lg overflow-y-auto rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl dark:border-dk-border dark:bg-dk-surface">
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-2 sm:px-6 sm:pt-6">
          <div>
            <h2 id="edit-targets-title" className="text-lg font-semibold text-slate-900 dark:text-white">
              Edit scraper targets
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Update what each scraper should pull. Leave a field blank to remove its target.
            </p>
          </div>
          <button
            type="button"
            onClick={() => !submitting && onOpenChange(false)}
            className="-mr-2 rounded-md p-1 text-slate-400 transition-colors hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-white/5 dark:hover:text-white"
            aria-label="Close"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        <div className="space-y-4 px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
          <CompetitorTargetForm values={values} onChange={handleChange} disabled={submitting} />
          {error && <p className="text-sm text-rose-600 dark:text-rose-400">{error}</p>}

          <div className="flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Cancel
            </button>
            <Button size="sm" onClick={handleSave} disabled={submitting} className="w-full sm:w-auto">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Saving…' : 'Save targets'}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function extractMessage(err: unknown): string {
  if (typeof err === 'object' && err !== null && 'response' in err) {
    const res = (err as { response?: { data?: { detail?: string; message?: string } } }).response;
    if (res?.data?.detail) return res.data.detail;
    if (res?.data?.message) return res.data.message;
  }
  if (err instanceof Error) return err.message;
  return 'Failed to save targets';
}
