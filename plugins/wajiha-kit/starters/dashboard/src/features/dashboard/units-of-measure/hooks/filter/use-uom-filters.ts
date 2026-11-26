import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';
import { useListSearch, type UpdateSearch } from '@/hooks/use-list-search';
import {
  UOM_DECIMALS,
  UOM_STATUSES,
  type UomDecimalsFilter,
  type UomStatusFilter,
} from '../../types/types';
import {
  defaultUnitOfMeasureSearch,
  type UnitOfMeasureSearch,
} from '../../validations/search';

const routeApi = getRouteApi('/_app/units-of-measure/');

const FILTER_KEYS = ['q', 'status', 'decimals'] as const;

export function toUomStatusFilter(value: string): UomStatusFilter {
  return UOM_STATUSES.find((status) => status === value) ?? 'all';
}

export function toUomDecimalsFilter(value: string): UomDecimalsFilter {
  return UOM_DECIMALS.find((decimals) => decimals === value) ?? 'all';
}

/** The URL state of the list: pagination, sorting and filters (the URL is the only copy). */
export function useUnitOfMeasureFilters() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const update: UpdateSearch<UnitOfMeasureSearch> = (updater, options) => {
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
      defaults: defaultUnitOfMeasureSearch,
      filterKeys: FILTER_KEYS,
      update,
    }),
  };
}
