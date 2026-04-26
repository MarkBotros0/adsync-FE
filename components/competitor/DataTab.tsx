'use client';

import { ChevronLeft, ChevronRight, Search, SlidersHorizontal } from 'lucide-react';
import { useEffect, useState } from 'react';
import { Button } from '@/components/ui/Button';
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select';

export interface SortOption {
  value: string;
  label: string;
}

interface DataTabHeaderProps {
  searchPlaceholder?: string;
  search: string;
  onSearch: (value: string) => void;
  sort: string;
  sortOptions: SortOption[];
  onSort: (value: string) => void;
  pageSize: number;
  onPageSize: (n: number) => void;
  /** Optional filter chips / extra controls (status filter, etc.). */
  filters?: React.ReactNode;
  /** Total rows (filtered) — shown to give context. */
  filteredCount: number;
  totalCount: number;
}

export function DataTabHeader({
  searchPlaceholder = 'Search…',
  search,
  onSearch,
  sort,
  sortOptions,
  onSort,
  pageSize,
  onPageSize,
  filters,
  filteredCount,
  totalCount,
}: DataTabHeaderProps) {
  const [filtersOpen, setFiltersOpen] = useState(false);
  return (
    <div className="space-y-3">
      <div className="flex flex-wrap items-center gap-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-slate-400" />
          <input
            type="search"
            value={search}
            onChange={(e) => onSearch(e.target.value)}
            placeholder={searchPlaceholder}
            className="w-full rounded-lg border border-slate-300 bg-white py-2 pl-9 pr-3 text-sm text-slate-900 outline-none transition-colors focus:border-blue-500 focus:ring-2 focus:ring-blue-500/30 dark:border-dk-border dark:bg-dk-raised dark:text-white"
          />
        </div>

        <Select value={sort} onValueChange={onSort}>
          <SelectTrigger className="w-[180px]">
            <SelectValue placeholder="Sort" />
          </SelectTrigger>
          <SelectContent>
            {sortOptions.map((opt) => (
              <SelectItem key={opt.value} value={opt.value}>
                {opt.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={String(pageSize)} onValueChange={(v) => onPageSize(Number(v))}>
          <SelectTrigger className="w-[110px]">
            <SelectValue />
          </SelectTrigger>
          <SelectContent>
            {[12, 24, 48, 96].map((n) => (
              <SelectItem key={n} value={String(n)}>
                {n} / page
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        {filters && (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setFiltersOpen((open) => !open)}
            className="md:hidden"
            aria-expanded={filtersOpen}
          >
            <SlidersHorizontal className="h-4 w-4" />
            Filters
          </Button>
        )}
      </div>

      {filters && (
        <div className={`${filtersOpen ? 'flex' : 'hidden'} flex-wrap items-center gap-2 md:flex`}>
          {filters}
        </div>
      )}

      <p className="text-xs text-slate-500 dark:text-slate-400">
        Showing <span className="tabular-nums">{filteredCount}</span> of{' '}
        <span className="tabular-nums">{totalCount}</span>
      </p>
    </div>
  );
}

// ── Pagination ──────────────────────────────────────────────────────────────

interface DataTabPaginationProps {
  page: number;
  pageSize: number;
  total: number;
  onPage: (page: number) => void;
}

export function DataTabPagination({ page, pageSize, total, onPage }: DataTabPaginationProps) {
  const pageCount = Math.max(1, Math.ceil(total / pageSize));
  const start = total === 0 ? 0 : page * pageSize + 1;
  const end = Math.min(total, (page + 1) * pageSize);
  if (pageCount <= 1) return null;
  return (
    <div className="flex items-center justify-between gap-2 pt-2">
      <span className="text-xs text-slate-500 dark:text-slate-400 tabular-nums">
        {start}–{end} of {total}
      </span>
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          disabled={page === 0}
          onClick={() => onPage(page - 1)}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>
        <span className="px-2 text-xs text-slate-600 dark:text-slate-300 tabular-nums">
          {page + 1} / {pageCount}
        </span>
        <Button
          variant="outline"
          size="sm"
          disabled={page >= pageCount - 1}
          onClick={() => onPage(page + 1)}
          aria-label="Next page"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}

// ── Hook for client-side sort/search/paginate ──────────────────────────────

export interface UseClientFilteredOptions<T> {
  rows: T[];
  search: string;
  searchAccessor?: (row: T) => string;
  sort: string;
  sortFn?: (a: T, b: T, sort: string) => number;
  page: number;
  pageSize: number;
  /** Optional pre-filter applied before search/sort/paginate. */
  preFilter?: (row: T) => boolean;
}

export interface ClientFilteredResult<T> {
  rows: T[];
  total: number;
  filteredTotal: number;
}

export function applyClientFiltering<T>(opts: UseClientFilteredOptions<T>): ClientFilteredResult<T> {
  const { rows, search, searchAccessor, sort, sortFn, page, pageSize, preFilter } = opts;
  let working = rows;
  if (preFilter) working = working.filter(preFilter);
  if (search && searchAccessor) {
    const needle = search.toLowerCase();
    working = working.filter((r) => searchAccessor(r).toLowerCase().includes(needle));
  }
  const filteredTotal = working.length;
  if (sortFn) {
    working = [...working].sort((a, b) => sortFn(a, b, sort));
  }
  const start = page * pageSize;
  const sliced = working.slice(start, start + pageSize);
  return { rows: sliced, total: rows.length, filteredTotal };
}

// ── Filter chip ─────────────────────────────────────────────────────────────

interface FilterChipProps {
  active: boolean;
  onClick: () => void;
  children: React.ReactNode;
}

export function FilterChip({ active, onClick, children }: FilterChipProps) {
  return (
    <button
      type="button"
      onClick={onClick}
      className={`rounded-full px-3 py-1 text-xs font-medium transition-colors ${
        active
          ? 'bg-blue-500 text-white'
          : 'bg-slate-100 text-slate-700 hover:bg-slate-200 dark:bg-dk-raised dark:text-slate-200 dark:hover:bg-white/10'
      }`}
    >
      {children}
    </button>
  );
}

// ── Debounced value hook ────────────────────────────────────────────────────

export function useDebouncedValue<T>(value: T, delay: number = 200): T {
  const [debounced, setDebounced] = useState(value);
  useEffect(() => {
    const id = window.setTimeout(() => setDebounced(value), delay);
    return () => window.clearTimeout(id);
  }, [value, delay]);
  return debounced;
}
