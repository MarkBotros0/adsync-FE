import { Crosshair } from 'lucide-react';
import { Button } from '@/components/ui/Button';

interface EmptyStateProps {
  onAdd: () => void;
}

export function EmptyState({ onAdd }: EmptyStateProps) {
  return (
    <div className="rounded-2xl border border-dashed border-slate-300 bg-white p-6 text-center sm:p-10 md:p-12 dark:border-dk-border dark:bg-dk-surface">
      <div className="mx-auto grid h-14 w-14 place-items-center rounded-2xl bg-gradient-to-br from-blue-500 to-violet-600 text-white shadow-lg">
        <Crosshair className="h-7 w-7" />
      </div>
      <h3 className="mt-4 text-lg font-semibold text-slate-900 dark:text-white">
        Track your first competitor
      </h3>
      <p className="mx-auto mt-2 max-w-lg text-sm text-slate-500 dark:text-slate-400">
        Add a brand name and we’ll automatically pull data from{' '}
        <strong className="text-slate-700 dark:text-slate-200">6 sources</strong>:
      </p>
      <ul className="mx-auto mt-5 grid w-full max-w-md grid-cols-1 gap-x-6 gap-y-2 text-left text-sm text-slate-600 sm:grid-cols-2 dark:text-slate-300">
        {[
          { color: 'bg-blue-500',    label: 'Facebook + Instagram ads' },
          { color: 'bg-pink-500',    label: 'Instagram profile + posts' },
          { color: 'bg-rose-500',    label: 'TikTok profile + videos' },
          { color: 'bg-emerald-500', label: 'Google search visibility' },
          { color: 'bg-violet-500',  label: 'Website messaging' },
          { color: 'bg-amber-500',   label: 'Google Maps reviews' },
        ].map(({ color, label }) => (
          <li key={label} className="flex items-center gap-2">
            <span className={`h-1.5 w-1.5 shrink-0 rounded-full ${color}`} />
            <span>{label}</span>
          </li>
        ))}
      </ul>
      <div className="mt-6 flex justify-center">
        <Button onClick={onAdd} className="w-full sm:w-auto">
          Add competitor
        </Button>
      </div>
    </div>
  );
}
