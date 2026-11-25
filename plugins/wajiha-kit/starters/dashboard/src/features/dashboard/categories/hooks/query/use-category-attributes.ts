import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchCategoryAttributes } from '../../services/categories.service';

export function useCategoryAttributes(categoryId: string | null) {
  return useQuery({
    queryKey: qk.categories.attributes(categoryId ?? ''),
    queryFn: () => fetchCategoryAttributes(categoryId ?? ''),
    enabled: !!categoryId,
  });
}
