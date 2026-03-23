'use client';

import { FiltersPanelContent } from './filters-panel-content';
import type { FiltersPanelContentProps } from './filters-panel-content';

export function RightPanel(props: FiltersPanelContentProps) {
  return (
    <aside className="hidden xl:flex flex-col w-52 shrink-0 border-l border-slate-200 dark:border-dk-border bg-white dark:bg-dk-surface overflow-y-auto">
      <FiltersPanelContent {...props} />
    </aside>
  );
}
