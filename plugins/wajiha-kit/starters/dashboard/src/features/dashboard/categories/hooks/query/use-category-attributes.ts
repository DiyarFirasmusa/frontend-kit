import { queryOptions, useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchCategoryAttributes } from '../../services/categories.service';

export function categoryAttributesQueryOptions(categoryId: string) {
  return queryOptions({
    queryKey: qk.categories.attributes(categoryId),
    queryFn: ({ signal }) => fetchCategoryAttributes(categoryId, { signal }),
  });
}

/** The attributes of one category, own and inherited (a bounded list, not paged). */
export function useCategoryAttributes(categoryId: string | null) {
  return useQuery({
    ...categoryAttributesQueryOptions(categoryId ?? ''),
    enabled: !!categoryId,
  });
}
