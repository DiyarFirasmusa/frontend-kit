import { getRouteApi } from '@tanstack/react-router';
import { useCallback } from 'react';
import { ALL_CATEGORIES } from '../../types/types';

const routeApi = getRouteApi('/_app/categories/');

/** The URL state of the tree page: the search text and the selected category. */
export function useCategoryFilters() {
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();

  const setQuery = useCallback(
    (q: string) => {
      void navigate({
        search: (prev) => ({ ...prev, q }),
        // Typing a search must not add a history entry per pause.
        replace: true,
      });
    },
    [navigate],
  );

  const select = useCallback(
    (category: string) => {
      void navigate({ search: (prev) => ({ ...prev, category }) });
    },
    [navigate],
  );

  const selectAll = useCallback(() => {
    select(ALL_CATEGORIES);
  }, [select]);

  return { search, setQuery, select, selectAll };
}
