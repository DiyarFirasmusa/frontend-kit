import { useCallback, useMemo, useState } from 'react';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { usePagination } from '@/hooks/use-pagination';
import type {
  SupplierListParams,
  SupplierSourceFilter,
  SupplierStatusFilter,
} from '../../types/types';

export const PAGE_SIZE = 10;

export function toSupplierStatusFilter(value: string): SupplierStatusFilter {
  return value === 'active' || value === 'inactive' ? value : 'all';
}

export function toSupplierSourceFilter(value: string): SupplierSourceFilter {
  return value === 'all' ? 'all' : 'registered';
}

export function useSupplierFilters() {
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { reset: resetPagination } = pagination;
  const [search, setSearchValue] = useState('');
  const debouncedSearch = useDebouncedValue(search, 400);
  const [statusFilter, setStatusValue] = useState<SupplierStatusFilter>('all');
  const [sourceFilter, setSourceValue] =
    useState<SupplierSourceFilter>('registered');

  const setSearch = useCallback(
    (value: string) => {
      setSearchValue(value);
      resetPagination();
    },
    [resetPagination],
  );

  const setStatusFilter = useCallback(
    (value: SupplierStatusFilter) => {
      setStatusValue(value);
      resetPagination();
    },
    [resetPagination],
  );

  const setSourceFilter = useCallback(
    (value: SupplierSourceFilter) => {
      setSourceValue(value);
      resetPagination();
    },
    [resetPagination],
  );

  const listParams: SupplierListParams = useMemo(
    () => ({
      q: debouncedSearch.trim() || undefined,
      isActive: statusFilter === 'all' ? undefined : statusFilter === 'active',
      includeUnregistered: sourceFilter === 'all' ? true : undefined,
    }),
    [debouncedSearch, statusFilter, sourceFilter],
  );

  return {
    search,
    setSearch,
    statusFilter,
    setStatusFilter,
    sourceFilter,
    setSourceFilter,
    listParams,
    isFiltered:
      search.trim() !== '' ||
      statusFilter !== 'all' ||
      sourceFilter !== 'registered',
    pagination,
  };
}
