import {
  keepPreviousData,
  queryOptions,
  useQuery,
} from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchItemCategories } from '../../services/categories.service';
import type { CategoryListParams } from '../../types/types';

/** Shared by the route loader (prefetch) and the page (read). */
export function categoriesListQueryOptions(params: CategoryListParams) {
  return queryOptions({
    queryKey: qk.categories.list(params),
    // The signal aborts the request when the search changes.
    queryFn: ({ signal }) => fetchItemCategories(params, { signal }),
    // The previous tree stays on screen while a search loads.
    placeholderData: keepPreviousData,
  });
}

export function useCategoriesList(params: CategoryListParams) {
  return useQuery(categoriesListQueryOptions(params));
}
