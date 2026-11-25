import { createFileRoute } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import CategoriesContainer from '@/features/dashboard/categories';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_dashboard/categories/')({
  beforeLoad: () => {
    requirePermission(PERMS.itemCategory.read);
  },
  loader: () => loadFeatureLocale('dashboard/categories'),
  component: CategoriesRoute,
});

function CategoriesRoute() {
  return <CategoriesContainer initialTab="categories" />;
}
