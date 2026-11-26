import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useListSearch, type UpdateSearch } from '@/hooks/use-list-search';
import {
  SUPPLIER_STATUSES,
  type SupplierStatusFilter,
} from '../../types/types';
import {
  defaultSupplierSearch,
  type SupplierSearch,
} from '../../validations/search';

const routeApi = getRouteApi('/_app/suppliers/');

const FILTER_KEYS = ['q', 'status'] as const;

export function toSupplierStatusFilter(value: string): SupplierStatusFilter {
  return SUPPLIER_STATUSES.find((status) => status === value) ?? 'all';
}

/** The URL state of the list: pagination, sorting and filters (the URL is the only copy). */
export function useSupplierFilters() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const update: UpdateSearch<SupplierSearch> = (updater, options) => {
    void navigate({ search: updater, replace: options?.replace });
  };
  const goToPage = useCallback(
    (page: number) => {
      void navigate({ search: (prev) => ({ ...prev, page }), replace: true });
    },
    [navigate],
  );
  return {
    search,
    goToPage,
    ...useListSearch({
      search,
      defaults: defaultSupplierSearch,
      filterKeys: FILTER_KEYS,
      update,
    }),
  };
}
