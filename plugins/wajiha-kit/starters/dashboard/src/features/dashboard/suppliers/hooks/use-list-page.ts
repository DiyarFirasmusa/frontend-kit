import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import { PERMS } from '@/constants/permissions';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import { useListExport } from '@/hooks/use-list-export';
import { useClampPage } from '@/hooks/use-list-search';
import { toTableStatus } from '@/utils/table-state';
import { getSupplierColumns } from '../components/supplier-columns';
import { fetchSuppliers } from '../services/suppliers.service';
import type { SupplierRow } from '../types/types';
import { toSupplierListParams } from '../utils/list-params';
import { getSupplierExportColumns } from '../utils/supplier-export-columns';
import { useSupplierFilters } from './filter/use-supplier-filters';
import type { SupplierDialogState } from './form/use-supplier-form-dialog';
import { useDeleteSupplier } from './query/use-supplier-mutations';
import { useSuppliersList } from './query/use-suppliers-list';
import { getSupplierRowActions } from './supplier-actions';

const NO_ROWS: SupplierRow[] = [];

export function getSupplierRowId(row: SupplierRow): string {
  return row.id;
}

/** Everything the suppliers list needs; the container only renders it. */
export function useSuppliersListPage() {
  const { t } = useTranslation();
  const can = useCan();
  const filters = useSupplierFilters();
  const params = toSupplierListParams(filters.search);
  const query = useSuppliersList(params);
  const [dialog, setDialog] = useState<SupplierDialogState>({ kind: 'closed' });
  const remove = useDeleteDialog(
    useDeleteSupplier(),
    (row: SupplierRow) => row.name ?? row.code ?? '',
  );
  const { openDelete } = remove;

  const getActions = useCallback(
    (row: SupplierRow) =>
      getSupplierRowActions(row, {
        t,
        can,
        onEdit: (target) => {
          setDialog({ kind: 'edit', supplierId: target.id });
        },
        onDelete: openDelete,
      }),
    [t, can, openDelete],
  );
  const columns = useMemo(
    () => getSupplierColumns({ t, getActions }),
    [t, getActions],
  );

  useClampPage(filters.search.page, query.data?.totalPages, filters.goToPage);

  const exportColumns = useMemo(() => getSupplierExportColumns(t), [t]);
  const exportExcel = useListExport({
    fileName: 'suppliers',
    sheetName: t('suppliers.title'),
    columns: exportColumns,
    params,
    fetchAll: fetchSuppliers,
    total: query.data?.totalElements,
  });

  return {
    t,
    rows: query.data?.content ?? NO_ROWS,
    rowCount: query.data?.totalElements,
    status: toTableStatus(query),
    retry: () => {
      void query.refetch();
    },
    columns,
    pagination: filters.pagination,
    sorting: filters.sorting,
    setPagination: filters.setPagination,
    setSorting: filters.setSorting,
    hasFilters: filters.hasFilters,
    clearFilters: filters.clear,
    canCreate: can(PERMS.supplier.create),
    openCreate: () => {
      setDialog({ kind: 'create' });
    },
    dialog,
    closeDialog: () => {
      setDialog({ kind: 'closed' });
    },
    exportExcel,
    deleteDialog: remove.dialog,
  };
}
