import { createFileRoute } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import SuppliersListContainer from '@/features/dashboard/suppliers';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_dashboard/suppliers/')({
  beforeLoad: () => {
    requirePermission(PERMS.supplier.read);
  },
  loader: () => loadFeatureLocale('dashboard/suppliers'),
  component: SuppliersListContainer,
});
