import { queryOptions, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchItemCategory } from '../../services/categories.service';

export function categoryDetailQueryOptions(id: string) {
  return queryOptions({
    queryKey: qk.categories.detail(id),
    queryFn: ({ signal }) => fetchItemCategory(id, { signal }),
  });
}

/** Edit reads the record by id, never the possibly stale tree node. */
export function useCategoryDetail(id: string | null) {
  return useQuery({
    ...categoryDetailQueryOptions(id ?? ''),
    enabled: id !== null,
  });
}
