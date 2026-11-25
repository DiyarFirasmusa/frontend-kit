import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { PERMS } from '@/constants/permissions';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { useExcelExport } from '@/hooks/use-excel-export';
import { directionOf } from '@/lib/i18n/languages';
import { useHasPermission } from '@/store/permission-store';
import type { ResolvedTableFilter } from '@/types/table';
import type { SupplierRow } from '../types/types';
import { getSupplierExportColumns } from '../utils/supplier-export-columns';
import {
  toSupplierSourceFilter,
  toSupplierStatusFilter,
  useSupplierFilters,
} from './filter/use-supplier-filters';
import {
  useDeleteSupplier,
  useUpdateSupplier,
} from './query/use-supplier-mutations';
import { useSuppliersList } from './query/use-suppliers-list';
import {
  getSupplierDeleteMode,
  toSupplierFormValues,
  toSupplierPayload,
} from './supplier-actions';

export function getSupplierRowId(row: SupplierRow): string {
  return row.id ?? `unregistered:${row.code ?? ''}:${row.name ?? ''}`;
}

export function useSuppliersListPage() {
  const { t, i18n } = useTranslation();
  const filters = useSupplierFilters();
  const { pagination } = filters;
  const { page, pageSize, skip, take, setPage, toTablePagination } = pagination;
  const query = useSuppliersList(filters.listParams);
  const remove = useDeleteSupplier();
  const update = useUpdateSupplier();
  const canWrite = useHasPermission(PERMS.supplier.write);
  const canDelete = useHasPermission(PERMS.supplier.delete);

  const [dialogOpen, setDialogOpen] = useState(false);
  const [editing, setEditing] = useState<SupplierRow | null>(null);
  const [registering, setRegistering] = useState<SupplierRow | null>(null);
  // Keeps the last target so the confirm text stays stable while it closes.
  const { deleteTarget, isDeleteOpen, openDelete, closeDelete } =
    useDeleteTarget<SupplierRow>();

  const allRows = useMemo(() => query.data ?? [], [query.data]);
  const rows = useMemo(
    () => allRows.slice(skip, skip + take),
    [allRows, skip, take],
  );
  const lastPage = Math.max(0, Math.ceil(allRows.length / pageSize) - 1);

  // Client-side paging: a shrinking list must not leave the page index past the end.
  useEffect(() => {
    if (query.isSuccess && page > lastPage) {
      setPage(lastPage);
    }
  }, [query.isSuccess, page, lastPage, setPage]);

  const exportColumns = useMemo(() => getSupplierExportColumns(t), [t]);
  const excel = useExcelExport({
    fileName: 'suppliers',
    sheetName: t('suppliers.title'),
    columns: exportColumns,
    load: () => allRows,
  });

  const filterDefinitions: ResolvedTableFilter[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('suppliers.filters.status'),
        options: [
          { value: 'active', label: t('common.active') },
          { value: 'inactive', label: t('common.inactive') },
        ],
      },
      {
        id: 'source',
        label: t('suppliers.filters.source'),
        allowAll: false,
        options: [
          { value: 'registered', label: t('suppliers.filters.registered') },
          { value: 'all', label: t('suppliers.filters.withUnregistered') },
        ],
      },
    ],
    [t],
  );

  const { setSearch, setStatusFilter, setSourceFilter } = filters;
  const handleFilterChange = useCallback(
    (id: string, value: string) => {
      if (id === 'status') {
        setStatusFilter(toSupplierStatusFilter(value));
      }
      if (id === 'source') {
        setSourceFilter(toSupplierSourceFilter(value));
      }
    },
    [setStatusFilter, setSourceFilter],
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatusFilter('all');
    setSourceFilter('registered');
  }, [setSearch, setStatusFilter, setSourceFilter]);

  const openCreate = useCallback(() => {
    setEditing(null);
    setRegistering(null);
    setDialogOpen(true);
  }, []);

  const openEdit = useCallback((row: SupplierRow) => {
    setEditing(row);
    setRegistering(null);
    setDialogOpen(true);
  }, []);

  const openRegister = useCallback((row: SupplierRow) => {
    setEditing(null);
    setRegistering(row);
    setDialogOpen(true);
  }, []);

  const onDialogOpenChange = useCallback((open: boolean) => {
    setDialogOpen(open);
    if (!open) {
      setEditing(null);
      setRegistering(null);
    }
  }, []);

  const requestDelete = useCallback((row: SupplierRow) => {
    openDelete(row);
  }, []);

  const deleteMode = deleteTarget
    ? getSupplierDeleteMode(deleteTarget)
    : 'delete';

  const confirmDelete = useCallback(() => {
    if (!deleteTarget) {
      return;
    }
    const onSuccess = () => {
      closeDelete();
    };
    if (getSupplierDeleteMode(deleteTarget) === 'deactivate') {
      update.mutate(
        {
          id: deleteTarget.id,
          payload: {
            ...toSupplierPayload(toSupplierFormValues(deleteTarget)),
            isActive: false,
          },
          successMessage: 'suppliers.messages.deactivated',
        },
        { onSuccess },
      );
      return;
    }
    remove.mutate(deleteTarget.id, { onSuccess });
  }, [deleteTarget, update, remove]);

  return {
    dir: directionOf(i18n.language),
    canWrite,
    canDelete,
    rows,
    allRows,
    exportExcel: {
      onExport: excel.exportExcel,
      isExporting: excel.isExporting,
      disabled: allRows.length === 0,
    },
    isFiltered: filters.isFiltered,
    isLoading: query.isLoading,
    isError: query.isError,
    refetch: () => {
      void query.refetch();
    },
    tablePagination: toTablePagination(allRows.length),
    toolbar: {
      search: filters.search,
      onSearchChange: setSearch,
      searchPlaceholder: t('suppliers.filters.searchPlaceholder'),
      filters: filterDefinitions,
      filterValues: {
        status: filters.statusFilter === 'all' ? '' : filters.statusFilter,
        source: filters.sourceFilter,
      },
      onFilterChange: handleFilterChange,
      onClearFilters: handleClearFilters,
      isDirty: filters.isFiltered,
    },
    dialog: {
      open: dialogOpen,
      editing,
      registering,
      openCreate,
      openEdit,
      openRegister,
      onOpenChange: onDialogOpenChange,
    },
    deleteDialog: {
      open: isDeleteOpen,
      mode: deleteMode,
      name: deleteTarget?.name ?? '',
      isPending: remove.isPending || update.isPending,
      onOpenChange: (open: boolean) => {
        if (!open) {
          closeDelete();
        }
      },
      onConfirm: confirmDelete,
      request: requestDelete,
    },
  };
}

export type SuppliersListPage = ReturnType<typeof useSuppliersListPage>;
