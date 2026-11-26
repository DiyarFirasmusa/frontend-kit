import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import { PERMS } from '@/constants/permissions';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import { useListExport } from '@/hooks/use-list-export';
import { useClampPage } from '@/hooks/use-list-search';
import { toTableStatus } from '@/utils/table-state';
import { getWarehouseColumns } from '../components/warehouse-columns';
import { fetchWarehouses } from '../services/warehouses.service';
import type { WarehouseRow } from '../types/types';
import { toWarehouseListParams } from '../utils/list-params';
import { getWarehouseExportColumns } from '../utils/warehouse-export-columns';
import { useWarehouseFilters } from './filter/use-warehouse-filters';
import type { WarehouseDialogState } from './form/use-warehouse-form-dialog';
import { useDeleteWarehouse } from './query/use-warehouse-mutations';
import { useWarehousesList } from './query/use-warehouses-list';
import { getWarehouseRowActions } from './warehouse-actions';

const NO_ROWS: WarehouseRow[] = [];

export function getWarehouseRowId(row: WarehouseRow): string {
  return row.id;
}

/** Everything the warehouses list needs; the container only renders it. */
export function useWarehousesListPage() {
  const { t } = useTranslation();
  const navigate = useNavigate();
  const can = useCan();
  const filters = useWarehouseFilters();
  const params = toWarehouseListParams(filters.search);
  const query = useWarehousesList(params);
  const [dialog, setDialog] = useState<WarehouseDialogState>({
    kind: 'closed',
  });
  const remove = useDeleteDialog(
    useDeleteWarehouse(),
    (row: WarehouseRow) => row.name ?? row.code ?? '',
  );
  const { openDelete } = remove;

  const getActions = useCallback(
    (row: WarehouseRow) =>
      getWarehouseRowActions(row, {
        t,
        can,
        onView: (target) => {
          void navigate({
            to: '/warehouses/$warehouseId',
            params: { warehouseId: target.id },
          });
        },
        onEdit: (target) => {
          setDialog({ kind: 'edit', warehouseId: target.id });
        },
        onDelete: openDelete,
      }),
    [t, can, navigate, openDelete],
  );
  const columns = useMemo(
    () => getWarehouseColumns({ t, getActions }),
    [t, getActions],
  );

  useClampPage(filters.search.page, query.data?.totalPages, filters.goToPage);

  const exportColumns = useMemo(() => getWarehouseExportColumns(t), [t]);
  const exportExcel = useListExport({
    fileName: 'warehouses',
    sheetName: t('warehouses.title'),
    columns: exportColumns,
    params,
    fetchAll: fetchWarehouses,
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
    canCreate: can(PERMS.warehouse.create),
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
