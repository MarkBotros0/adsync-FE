'use client';

import { useEffect, useRef, useState } from 'react';
import { X, Loader2 } from 'lucide-react';
import { Button } from '@/components/ui/Button';
import { competitorAPI } from '@/lib/api';
import { useBrandAuthContext } from '@/contexts/brand-auth-context';
import { toast } from 'sonner';
import type { Competitor } from '@/lib/types';

interface AddCompetitorDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onCreated: (competitor: Competitor) => void;
}

export function AddCompetitorDialog({ open, onOpenChange, onCreated }: AddCompetitorDialogProps) {
  const { token } = useBrandAuthContext();
  const [name, setName] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const inputRef = useRef<HTMLInputElement | null>(null);

  // Reset on open + autofocus.
  useEffect(() => {
    if (open) {
      setName('');
      setError(null);
      // Defer to allow the dialog to mount.
      requestAnimationFrame(() => inputRef.current?.focus());
    }
  }, [open]);

  // Close on Escape.
  useEffect(() => {
    if (!open) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && !submitting) onOpenChange(false);
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [open, submitting, onOpenChange]);

  if (!open) return null;

  const trimmed = name.trim();
  const canSubmit = trimmed.length > 0 && !submitting;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!canSubmit || !token) return;
    setSubmitting(true);
    setError(null);
    try {
      const res = await competitorAPI.create(token, { name: trimmed });
      onCreated(res.data.data.competitor);
      toast.success(`Started scraping "${trimmed}"`);
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
      aria-labelledby="add-competitor-title"
    >
      <div
        className="absolute inset-0 bg-slate-900/50 backdrop-blur-sm"
        onClick={() => !submitting && onOpenChange(false)}
        aria-hidden
      />
      <div className="relative w-full max-w-md rounded-t-2xl border border-slate-200 bg-white shadow-2xl sm:rounded-2xl dark:border-dk-border dark:bg-dk-surface">
        <div className="flex items-start justify-between gap-4 px-5 pt-5 pb-2 sm:px-6 sm:pt-6">
          <div>
            <h2
              id="add-competitor-title"
              className="text-lg font-semibold text-slate-900 dark:text-white"
            >
              Add a competitor
            </h2>
            <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
              Enter a brand name. We’ll automatically pull Facebook + Instagram ads, Instagram & TikTok, Google search, the website, and Google Maps reviews.
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

        <form onSubmit={handleSubmit} className="px-5 pb-5 pt-3 sm:px-6 sm:pb-6">
          <label
            htmlFor="competitor-name"
            className="block text-sm font-medium text-slate-700 dark:text-slate-200"
          >
            Brand name
          </label>
          <input
            ref={inputRef}
            id="competitor-name"
            type="text"
            value={name}
            onChange={(e) => setName(e.target.value)}
            placeholder="e.g. Audi"
            maxLength={120}
            disabled={submitting}
            className="mt-2 block w-full rounded-lg border border-slate-300 bg-white px-3 py-2 text-sm text-slate-900 shadow-sm outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 disabled:opacity-60 dark:border-dk-border dark:bg-dk-raised dark:text-white"
          />
          {error && (
            <p className="mt-2 text-sm text-rose-600 dark:text-rose-400">{error}</p>
          )}

          <div className="mt-6 flex flex-col-reverse gap-2 sm:flex-row sm:justify-end">
            <button
              type="button"
              onClick={() => onOpenChange(false)}
              disabled={submitting}
              className="rounded-lg px-4 py-2 text-sm font-semibold text-slate-700 transition-colors hover:bg-slate-100 disabled:opacity-50 dark:text-slate-200 dark:hover:bg-white/10 dark:hover:text-white"
            >
              Cancel
            </button>
            <Button type="submit" size="sm" disabled={!canSubmit} className="w-full sm:w-auto">
              {submitting && <Loader2 className="h-4 w-4 animate-spin" />}
              {submitting ? 'Adding…' : 'Add & scrape'}
            </Button>
          </div>
        </form>
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
  return 'Failed to add competitor';
}
