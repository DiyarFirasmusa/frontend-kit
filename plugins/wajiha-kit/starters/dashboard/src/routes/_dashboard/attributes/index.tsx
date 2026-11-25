import { createFileRoute } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import CategoriesContainer from '@/features/dashboard/categories';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

/* The attribute definitions are the second tab of the categories feature, with
   their own address so the sidebar can link straight to them. */
export const Route = createFileRoute('/_dashboard/attributes/')({
  beforeLoad: () => {
    requirePermission(PERMS.attributeDefinition.read);
  },
  loader: () => loadFeatureLocale('dashboard/categories'),
  component: AttributesRoute,
});

function AttributesRoute() {
  return <CategoriesContainer initialTab="attributes" />;
}
