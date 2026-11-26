import { getRouteApi } from '@tanstack/react-router';
import type { PaginationState, SortingState } from '@tanstack/react-table';
import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import { PERMS } from '@/constants/permissions';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { useExcelExport } from '@/hooks/use-excel-export';
import {
  toPaginationState,
  toSortingState,
  toSortParam,
  toTableStatus,
} from '@/utils/table-state';
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

const routeApi = getRouteApi('/_app/suppliers/');
const NO_ROWS: SupplierRow[] = [];
/** One request for the whole filtered set; the backend caps `size`. */
const EXPORT_PAGE_SIZE = 1000;

export function getSupplierRowId(row: SupplierRow): string {
  return row.id;
}

/** Everything the suppliers list needs; the container only renders it. */
export function useSuppliersListPage() {
  const { t } = useTranslation();
  const search = routeApi.useSearch();
  const navigate = routeApi.useNavigate();
  const can = useCan();
  const filters = useSupplierFilters();
  const params = toSupplierListParams(search);
  const query = useSuppliersList(params);
  const remove = useDeleteSupplier();
  const [dialog, setDialog] = useState<SupplierDialogState>({ kind: 'closed' });
  const { deleteTarget, isDeleteOpen, openDelete, closeDelete } =
    useDeleteTarget<SupplierRow>();

  const pagination = useMemo(
    () => toPaginationState(search.page, search.pageSize),
    [search.page, search.pageSize],
  );
  const sorting = useMemo(() => toSortingState(search.sort), [search.sort]);

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

  const setPagination = (next: PaginationState) => {
    void navigate({
      search: (prev) => ({
        ...prev,
        pageSize: next.pageSize,
        // A new page size starts over; otherwise go to the requested page.
        page: next.pageSize === prev.pageSize ? next.pageIndex + 1 : 1,
      }),
    });
  };
  const setSorting = (next: SortingState) => {
    void navigate({
      search: (prev) => ({ ...prev, sort: toSortParam(next), page: 1 }),
    });
  };

  // A shared link or deleting the last row can leave the page past the end.
  const totalPages = query.data?.totalPages;
  useEffect(() => {
    if (
      totalPages !== undefined &&
      totalPages > 0 &&
      search.page > totalPages
    ) {
      void navigate({
        search: (prev) => ({ ...prev, page: totalPages }),
        replace: true,
      });
    }
  }, [totalPages, search.page, navigate]);

  const exportColumns = useMemo(() => getSupplierExportColumns(t), [t]);
  const excel = useExcelExport({
    fileName: 'suppliers',
    sheetName: t('suppliers.title'),
    columns: exportColumns,
    // The export covers the filtered set, not the page on screen.
    load: async () => {
      const all = await fetchSuppliers({
        ...params,
        page: 1,
        pageSize: EXPORT_PAGE_SIZE,
      });
      return {
        rows: all.content,
        total: all.totalElements,
        isTruncated: all.totalElements > all.content.length,
      };
    },
  });

  const confirmDelete = () => {
    // Single-flight: the confirm button is disabled too, this covers Enter.
    if (!deleteTarget || remove.isPending) {
      return;
    }
    remove.mutate(deleteTarget.id, { onSuccess: closeDelete });
  };

  return {
    t,
    rows: query.data?.content ?? NO_ROWS,
    rowCount: query.data?.totalElements,
    status: toTableStatus(query),
    retry: () => {
      void query.refetch();
    },
    columns,
    pagination,
    sorting,
    setPagination,
    setSorting,
    hasFilters: filters.activeCount > 0,
    clearFilters: filters.clear,
    canCreate: can(PERMS.supplier.create),
    openCreate: () => {
      setDialog({ kind: 'create' });
    },
    dialog,
    closeDialog: () => {
      setDialog({ kind: 'closed' });
    },
    exportExcel: {
      onExport: excel.exportExcel,
      isExporting: excel.isExporting,
      disabled: (query.data?.totalElements ?? 0) === 0,
    },
    deleteDialog: {
      open: isDeleteOpen,
      name: deleteTarget?.name ?? '',
      isPending: remove.isPending,
      onOpenChange: (open: boolean) => {
        if (!open && !remove.isPending) {
          closeDelete();
        }
      },
      onConfirm: confirmDelete,
    },
  };
}
