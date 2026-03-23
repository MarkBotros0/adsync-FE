'use client';

import { useEffect } from 'react';
import { X, SlidersHorizontal } from 'lucide-react';
import { FiltersPanelContent } from './filters-panel-content';
import type { FiltersPanelContentProps } from './filters-panel-content';

interface MobileFiltersSheetProps extends FiltersPanelContentProps {
  isOpen: boolean;
  onClose: () => void;
  activeFilterCount: number;
}

export function MobileFiltersSheet({
  isOpen,
  onClose,
  activeFilterCount,
  ...filterProps
}: MobileFiltersSheetProps) {
  // Lock body scroll when open
  useEffect(() => {
    if (isOpen) {
      document.body.style.overflow = 'hidden';
    } else {
      document.body.style.overflow = '';
    }
    return () => { document.body.style.overflow = ''; };
  }, [isOpen]);

  // Close on Escape key
  useEffect(() => {
    if (!isOpen) return;
    const handler = (e: KeyboardEvent) => {
      if (e.key === 'Escape') onClose();
    };
    document.addEventListener('keydown', handler);
    return () => document.removeEventListener('keydown', handler);
  }, [isOpen, onClose]);

  return (
    <>
      {/* Backdrop */}
      <div
        aria-hidden="true"
        onClick={onClose}
        className={`xl:hidden fixed inset-0 z-40 bg-black/40 backdrop-blur-sm transition-opacity duration-300 ${
          isOpen ? 'opacity-100 pointer-events-auto' : 'opacity-0 pointer-events-none'
        }`}
      />

      {/* Bottom sheet */}
      <div
        role="dialog"
        aria-modal="true"
        aria-label="Filters"
        className={`xl:hidden fixed bottom-0 left-0 right-0 z-50 bg-white dark:bg-dk-surface rounded-t-2xl shadow-2xl transition-transform duration-300 ease-out ${
          isOpen ? 'translate-y-0' : 'translate-y-full'
        }`}
        style={{ maxHeight: '85dvh' }}
      >
        {/* Drag handle */}
        <div className="flex justify-center pt-3 pb-1">
          <div className="h-1 w-10 rounded-full bg-slate-300 dark:bg-slate-600" />
        </div>

        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-slate-200 dark:border-dk-border">
          <div className="flex items-center gap-2">
            <SlidersHorizontal className="h-4 w-4 text-violet-500" />
            <h2 className="text-sm font-semibold text-slate-800 dark:text-slate-100">Filters</h2>
            {activeFilterCount > 0 && (
              <span className="inline-flex items-center justify-center h-5 min-w-5 px-1.5 rounded-full bg-violet-500 text-white text-[10px] font-bold">
                {activeFilterCount}
              </span>
            )}
          </div>
          <button
            onClick={onClose}
            aria-label="Close filters"
            className="p-1.5 rounded-lg text-slate-500 hover:text-slate-800 dark:hover:text-white hover:bg-slate-100 dark:hover:bg-dk-raised transition-colors"
          >
            <X className="h-4 w-4" />
          </button>
        </div>

        {/* Scrollable content */}
        <div className="overflow-y-auto" style={{ maxHeight: 'calc(85dvh - 88px)' }}>
          <FiltersPanelContent {...filterProps} />
        </div>
      </div>
    </>
  );
}
