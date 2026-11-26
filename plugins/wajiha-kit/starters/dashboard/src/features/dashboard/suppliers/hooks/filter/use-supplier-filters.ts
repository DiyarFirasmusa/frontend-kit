import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';
import {
  SUPPLIER_STATUSES,
  type SupplierStatusFilter,
} from '../../types/types';
import {
  defaultSupplierSearch,
  type SupplierSearch,
} from '../../validations/search';

const routeApi = getRouteApi('/_app/suppliers/');

type FilterPatch = Partial<Pick<SupplierSearch, 'q' | 'status'>>;

export function toSupplierStatusFilter(value: string): SupplierStatusFilter {
  return SUPPLIER_STATUSES.find((status) => status === value) ?? 'all';
}

/** Reads and writes the list's filters; the URL is the only copy. */
export function useSupplierFilters() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const setFilters = useCallback(
    (patch: FilterPatch) => {
      void navigate({
        search: (prev) => ({ ...prev, ...patch, page: 1 }),
        // Typing a search must not add a history entry per pause.
        replace: patch.q !== undefined,
      });
    },
    [navigate],
  );

  const clear = useCallback(() => {
    void navigate({
      search: (prev) => ({
        ...prev,
        q: defaultSupplierSearch.q,
        status: defaultSupplierSearch.status,
        page: 1,
      }),
    });
  }, [navigate]);

  const activeCount =
    Number(search.q !== defaultSupplierSearch.q) +
    Number(search.status !== defaultSupplierSearch.status);

  return {
    values: { q: search.q, status: search.status },
    setFilters,
    clear,
    activeCount,
  };
}
