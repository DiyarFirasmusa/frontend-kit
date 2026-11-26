import { useNavigate } from '@tanstack/react-router';
import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import { PERMS } from '@/constants/permissions';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { useExcelExport } from '@/hooks/use-excel-export';
import { usePagination } from '@/hooks/use-pagination';
import { directionOf } from '@/lib/i18n/languages';
import type { WarehouseResponse } from '@/types/api/warehouses';
import type { ResolvedTableFilter } from '@/types/table';
import { getWarehouseColumns } from '../components/warehouse-columns';
import type { WarehouseFlagFilter } from '../types/types';
import { getWarehouseExportColumns } from '../utils/warehouse-export-columns';
import {
  filterWarehousesByManager,
  getWarehouseManagerOptions,
} from '../utils/warehouse-managers';
import { toWarehouseListParams } from '../utils/warehouse-params';
import { useWarehouseFormDialog } from './form/use-warehouse-form-dialog';
import { useDeleteWarehouse } from './query/use-warehouse-mutations';
import { useWarehousesList } from './query/use-warehouses-list';

export const PAGE_SIZE = 10;

function toFlag(value: string): WarehouseFlagFilter {
  return value === 'true' || value === 'false' ? value : '';
}

const getWarehouseRowId = (row: WarehouseResponse) => row.id;

export function useWarehousesListPage() {
  const { t, i18n } = useTranslation();
  const navigate = useNavigate();
  const can = useCan();
  const canCreate = can(PERMS.warehouse.create);
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { reset: resetPagination } = pagination;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [isActive, setIsActive] = useState<WarehouseFlagFilter>('');
  const [isTransit, setIsTransit] = useState<WarehouseFlagFilter>('');
  const [managerKey, setManagerKey] = useState('');
  // Keeps the last row so the dialog text stays stable while it closes.
  const { deleteTarget, isDeleteOpen, openDelete, closeDelete } =
    useDeleteTarget<WarehouseResponse>();

  const handleSearchChange = useCallback(
    (value: string) => {
      setSearch(value);
      resetPagination();
    },
    [resetPagination],
  );

  const handleFilterChange = useCallback(
    (id: string, value: string) => {
      if (id === 'isTransit') {
        setIsTransit(toFlag(value));
      }
      if (id === 'isActive') {
        setIsActive(toFlag(value));
      }
      if (id === 'manager') {
        setManagerKey(value);
      }
      resetPagination();
    },
    [resetPagination],
  );

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setIsActive('');
    setIsTransit('');
    setManagerKey('');
    resetPagination();
  }, [resetPagination]);

  const handleDelete = useCallback((row: WarehouseResponse) => {
    openDelete(row);
  }, []);

  const listParams = useMemo(
    () =>
      toWarehouseListParams({
        q: search === '' ? '' : debouncedSearch,
        isActive,
        isTransit,
      }),
    [search, debouncedSearch, isActive, isTransit],
  );
  const query = useWarehousesList(listParams);
  const remove = useDeleteWarehouse();
  const formDialog = useWarehouseFormDialog();
  const { openEdit } = formDialog;

  const onView = useCallback(
    (row: WarehouseResponse) => {
      void navigate({
        to: '/warehouses/$warehouseId',
        params: { warehouseId: row.id },
      });
    },
    [navigate],
  );

  const columns = useMemo(
    () =>
      getWarehouseColumns({
        t,
        can,
        onView,
        onEdit: openEdit,
        onDelete: handleDelete,
      }),
    [t, can, onView, openEdit, handleDelete],
  );

  const managerOptions = useMemo(
    () => getWarehouseManagerOptions(query.data ?? []),
    [query.data],
  );

  const filters: ResolvedTableFilter[] = useMemo(
    () => [
      {
        id: 'isActive',
        label: t('warehouses.list.filterStatus'),
        options: [
          { value: 'true', label: t('common.active') },
          { value: 'false', label: t('common.inactive') },
        ],
      },
      {
        id: 'isTransit',
        label: t('warehouses.list.filterType'),
        options: [
          { value: 'false', label: t('warehouses.type.regular') },
          { value: 'true', label: t('warehouses.type.transit') },
        ],
      },
      {
        id: 'manager',
        label: t('warehouses.list.filterManager'),
        options: managerOptions,
      },
    ],
    [t, managerOptions],
  );

  const filtered = useMemo(
    () => filterWarehousesByManager(query.data ?? [], managerKey),
    [query.data, managerKey],
  );

  const exportColumns = useMemo(() => getWarehouseExportColumns(t), [t]);
  const excel = useExcelExport({
    fileName: 'warehouses',
    sheetName: t('warehouses.title'),
    columns: exportColumns,
    load: () => filtered,
  });

  // A refetch can shrink the list under the current page; clamp so the pager
  // and the sliced rows always agree.
  const lastPage = Math.max(0, Math.ceil(filtered.length / PAGE_SIZE) - 1);
  const currentPage = Math.min(pagination.page, lastPage);

  const pageItems = useMemo(
    () =>
      filtered.slice(currentPage * PAGE_SIZE, (currentPage + 1) * PAGE_SIZE),
    [filtered, currentPage],
  );

  return {
    dir: directionOf(i18n.language),
    canCreate,
    formDialog,
    exportExcel: {
      onExport: excel.exportExcel,
      isExporting: excel.isExporting,
      disabled: filtered.length === 0,
    },
    toolbar: {
      search,
      onSearchChange: handleSearchChange,
      searchPlaceholder: t('warehouses.list.searchPlaceholder'),
      filters,
      filterValues: { isActive, isTransit, manager: managerKey },
      onFilterChange: handleFilterChange,
      onClearFilters: handleClearFilters,
      isDirty:
        search !== '' ||
        isActive !== '' ||
        isTransit !== '' ||
        managerKey !== '',
    },
    table: {
      columns,
      data: pageItems,
      getRowId: getWarehouseRowId,
      isLoading: query.isLoading,
      isError: query.isError,
      errorLabel: t('common.loadError'),
      onRetry: () => {
        void query.refetch();
      },
      onRowClick: onView,
      serverPagination: {
        ...pagination.toTablePagination(filtered.length),
        page: currentPage,
      },
      noResultsLabel: t('warehouses.list.empty'),
    },
    deleteDialog: {
      open: isDeleteOpen,
      name: deleteTarget?.name ?? '',
      isPending: remove.isPending,
      onOpenChange: (open: boolean) => {
        if (!open) {
          closeDelete();
        }
      },
      onConfirm: () => {
        if (!deleteTarget) {
          return;
        }
        remove.mutate(deleteTarget.id, {
          onSuccess: () => {
            closeDelete();
            resetPagination();
          },
        });
      },
    },
  };
}
