interface EmptyTabProps {
  title: string;
  description: string;
}

export function EmptyTab({ title, description }: EmptyTabProps) {
  return (
    <div className="rounded-xl border border-dashed border-slate-300 bg-white p-10 text-center dark:border-dk-border dark:bg-dk-surface">
      <h3 className="text-base font-semibold text-slate-900 dark:text-white">{title}</h3>
      <p className="mx-auto mt-2 max-w-md text-sm text-slate-500 dark:text-slate-400">
        {description}
      </p>
    </div>
  );
}
