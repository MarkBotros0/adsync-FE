export default function Loading() {
  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-dk-bg">
      <div className="h-24 border-b border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface" />
      <div className="flex-1 space-y-3 px-5 py-6 md:px-8 md:py-8">
        {[0, 1, 2].map((i) => (
          <div
            key={i}
            className="h-20 animate-pulse rounded-xl border border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface"
          />
        ))}
      </div>
    </div>
  );
}
