import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useListSearch, type UpdateSearch } from '@/hooks/use-list-search';
import {
  WAREHOUSE_STATUSES,
  WAREHOUSE_TYPES,
  type WarehouseStatusFilter,
  type WarehouseTypeFilter,
} from '../../types/types';
import {
  defaultWarehouseSearch,
  type WarehouseSearch,
} from '../../validations/search';

const routeApi = getRouteApi('/_app/warehouses/');

const FILTER_KEYS = ['q', 'status', 'type'] as const;

export function toWarehouseStatusFilter(value: string): WarehouseStatusFilter {
  return WAREHOUSE_STATUSES.find((status) => status === value) ?? 'all';
}

export function toWarehouseTypeFilter(value: string): WarehouseTypeFilter {
  return WAREHOUSE_TYPES.find((type) => type === value) ?? 'all';
}

/** The URL state of the list: pagination, sorting and filters (the URL is the only copy). */
export function useWarehouseFilters() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const update: UpdateSearch<WarehouseSearch> = (updater, options) => {
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
      defaults: defaultWarehouseSearch,
      filterKeys: FILTER_KEYS,
      update,
    }),
  };
}
