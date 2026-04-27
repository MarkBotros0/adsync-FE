import { EchofoldSpinner } from '@/components/brand/echofold-spinner';

export default function Loading() {
  return (
    <div className="flex h-full flex-col bg-slate-50 dark:bg-dk-bg">
      <div className="h-24 border-b border-slate-200 bg-white dark:border-dk-border dark:bg-dk-surface" />
      <div className="flex flex-1 items-center justify-center px-5 py-6 md:px-8 md:py-8">
        <EchofoldSpinner size="md" label="Loading competitors" />
      </div>
    </div>
  );
}
