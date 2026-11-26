import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import CategoriesContainer from '@/features/dashboard/categories';
import { categoriesListQueryOptions } from '@/features/dashboard/categories/hooks/query/use-categories-list';
import {
  categorySearchSchema,
  defaultCategorySearch,
} from '@/features/dashboard/categories/validations/search';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/categories/')({
  validateSearch: categorySearchSchema,
  search: { middlewares: [stripSearchParams(defaultCategorySearch)] },
  beforeLoad: () => {
    requirePermission(PERMS.itemCategory.view);
  },
  // Only the search text changes what the list request returns; the selected
  // category is read from the same tree.
  loaderDeps: ({ search }) => ({ q: search.q }),
  loader: ({ context, deps }) => {
    // Start the fetches, do not wait: the tree keeps the previous one meanwhile.
    for (const q of new Set([deps.q, ''])) {
      void context.queryClient
        .query(categoriesListQueryOptions({ q }))
        .catch(() => null);
    }
    return loadFeatureLocale('dashboard/categories');
  },
  component: CategoriesContainer,
});
