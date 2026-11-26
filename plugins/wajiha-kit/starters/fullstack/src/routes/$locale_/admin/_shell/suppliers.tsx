import { createFileRoute } from '@tanstack/react-router';
import { useCallback } from 'react';
import { PERMS } from '@/features/admin/constants/permissions';
import { adminHead } from '@/features/admin/layout/admin-head';
import { SuppliersPage } from '@/features/admin/suppliers';
import {
  parseSuppliersSearch,
  type SuppliersSearch,
} from '@/features/admin/suppliers/supplier-search';
import { toLocale } from '@/shared/lib/i18n/languages';

export const Route = createFileRoute('/$locale_/admin/_shell/suppliers')({
  validateSearch: parseSuppliersSearch,
  beforeLoad: async ({ params }) => {
    const { requirePermission } = await import('@/features/admin/guards/route-guards');
    requirePermission(toLocale(params.locale), PERMS.supplier.read);
  },
  head: adminHead('suppliers.title'),
  component: SuppliersRoute,
});

function SuppliersRoute() {
  const search = Route.useSearch();
  const navigate = Route.useNavigate();
  // Filters and paging replace the history entry: back leaves the page instead of undoing each key.
  const onSearchChange = useCallback(
    (next: SuppliersSearch) => {
      void navigate({ search: next, replace: true });
    },
    [navigate],
  );
  return <SuppliersPage search={search} onSearchChange={onSearchChange} />;
}
