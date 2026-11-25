import { useQuery } from '@tanstack/react-query';
import { qk } from '@/constants/query-keys';
import { fetchItemCategories } from '../../services/categories.service';

export function useItemCategories() {
  return useQuery({
    queryKey: qk.categories.list({}),
    queryFn: () => fetchItemCategories({}),
  });
}
