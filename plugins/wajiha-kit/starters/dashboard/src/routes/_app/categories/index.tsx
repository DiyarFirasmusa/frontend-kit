import { createFileRoute } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import CategoriesContainer from '@/features/dashboard/categories';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/categories/')({
  beforeLoad: () => {
    requirePermission(PERMS.itemCategory.view);
  },
  loader: () => loadFeatureLocale('dashboard/categories'),
  component: CategoriesRoute,
});

function CategoriesRoute() {
  return <CategoriesContainer initialTab="categories" />;
}
