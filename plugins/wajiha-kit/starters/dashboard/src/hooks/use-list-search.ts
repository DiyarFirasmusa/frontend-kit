import type { PaginationState, SortingState } from '@tanstack/react-table';
import { useEffect, useMemo } from 'react';
import {
  toPaginationState,
  toSortingState,
  toSortParam,
} from '@/utils/table-state';

/** The URL fields every list has; each list adds its own filters. */
export interface ListSearchBase {
  page: number;
  pageSize: number;
  sort: string;
}

/**
 * Rewrites the URL search from the previous one. The entity's route supplies
 * it (see `use-*-filters.ts`), so the types stay those of that route.
 */
export type UpdateSearch<S> = (
  updater: (prev: S) => S,
  options?: { replace?: boolean },
) => void;

interface UseListSearchOptions<S extends ListSearchBase> {
  search: S;
  defaults: S;
  /** The search fields that are filters (not page, size or sort). */
  filterKeys: readonly (keyof S)[];
  update: UpdateSearch<S>;
}

function pickKeys<S>(source: S, keys: readonly (keyof S)[]): Partial<S> {
  const picked: Partial<S> = {};
  for (const key of keys) {
    picked[key] = source[key];
  }
  return picked;
}

/**
 * Everything a list page reads from and writes to the URL: the table's
 * pagination and sorting, the filters, and clearing them. The URL is the only
 * copy of this state (routing.md); nothing here is `useState`.
 */
export function useListSearch<S extends ListSearchBase>({
  search,
  defaults,
  filterKeys,
  update,
}: UseListSearchOptions<S>) {
  const pagination = useMemo(
    () => toPaginationState(search.page, search.pageSize),
    [search.page, search.pageSize],
  );
  const sorting = useMemo(() => toSortingState(search.sort), [search.sort]);

  const setPagination = (next: PaginationState) => {
    update((prev) => ({
      ...prev,
      pageSize: next.pageSize,
      // A new page size starts over; otherwise go to the requested page.
      page: next.pageSize === prev.pageSize ? next.pageIndex + 1 : 1,
    }));
  };

  const setSorting = (next: SortingState) => {
    update((prev) => ({ ...prev, sort: toSortParam(next), page: 1 }));
  };

  /** Changing a filter goes back to page 1. */
  const setFilters = (change: Partial<S>) => {
    update((prev) => ({ ...prev, ...change, page: 1 }), {
      // Typing in the search box must not add a history entry per pause.
      replace: 'q' in change,
    });
  };

  const clear = () => {
    update((prev) => ({
      ...prev,
      ...pickKeys(defaults, filterKeys),
      page: 1,
    }));
  };

  const activeCount = filterKeys.filter(
    (key) => search[key] !== defaults[key],
  ).length;

  return {
    pagination,
    sorting,
    setPagination,
    setSorting,
    setFilters,
    clear,
    activeCount,
    hasFilters: activeCount > 0,
  };
}

/**
 * A shared link, or deleting the last row of the last page, can leave the page
 * past the end: replace it with the last real page.
 */
export function useClampPage(
  page: number,
  totalPages: number | undefined,
  goToPage: (page: number) => void,
) {
  useEffect(() => {
    if (totalPages !== undefined && totalPages > 0 && page > totalPages) {
      goToPage(totalPages);
    }
  }, [page, totalPages, goToPage]);
}
