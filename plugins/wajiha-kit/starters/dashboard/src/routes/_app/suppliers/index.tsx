import { createFileRoute, stripSearchParams } from '@tanstack/react-router';
import { PERMS } from '@/constants/permissions';
import SuppliersListContainer from '@/features/dashboard/suppliers';
import { suppliersListQueryOptions } from '@/features/dashboard/suppliers/hooks/query/use-suppliers-list';
import { toSupplierListParams } from '@/features/dashboard/suppliers/utils/list-params';
import {
  defaultSupplierSearch,
  supplierSearchSchema,
} from '@/features/dashboard/suppliers/validations/search';
import { requirePermission } from '@/guards/route-guards';
import { loadFeatureLocale } from '@/lib/i18n/i18n';

export const Route = createFileRoute('/_app/suppliers/')({
  validateSearch: supplierSearchSchema,
  search: { middlewares: [stripSearchParams(defaultSupplierSearch)] },
  beforeLoad: () => {
    requirePermission(PERMS.supplier.view);
  },
  loaderDeps: ({ search }) => toSupplierListParams(search),
  loader: ({ context, deps }) => {
    // Start the fetch, do not wait: the table keeps the previous page meanwhile.
    void context.queryClient
      .query(suppliersListQueryOptions(deps))
      .catch(() => null);
    return loadFeatureLocale('dashboard/suppliers');
  },
  component: SuppliersListContainer,
});
