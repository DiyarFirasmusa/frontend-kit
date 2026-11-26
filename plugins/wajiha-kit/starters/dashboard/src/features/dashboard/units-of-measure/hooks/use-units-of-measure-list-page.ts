import { useCallback, useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import { PERMS } from '@/constants/permissions';
import { useDebouncedValue } from '@/hooks/use-debounced-value';
import { useDeleteTarget } from '@/hooks/use-delete-target';
import { useExcelExport } from '@/hooks/use-excel-export';
import { usePagination } from '@/hooks/use-pagination';
import { directionOf } from '@/lib/i18n/languages';
import type { ResolvedTableFilter } from '@/types/table';
import { getUnitOfMeasureColumns } from '../components/uom-columns';
import type { UnitOfMeasureRow } from '../types/types';
import { DECIMAL_PLACES_OPTIONS } from '../utils/list-filters';
import { getUnitOfMeasureExportColumns } from '../utils/uom-export-columns';
import { useUnitOfMeasureFormDialog } from './form/use-uom-form-dialog';
import { useUnitsOfMeasureList } from './query/use-units-of-measure-list';
import { useDeleteUnitOfMeasure } from './query/use-uom-mutations';

export const PAGE_SIZE = 10;

type StatusFilter = '' | 'true' | 'false';

function toStatus(value: string): StatusFilter {
  return value === 'true' || value === 'false' ? value : '';
}

const getUnitOfMeasureRowId = (row: UnitOfMeasureRow) => row.id;

export function useUnitsOfMeasureListPage() {
  const { t, i18n } = useTranslation();
  const can = useCan();
  const canCreate = can(PERMS.unitOfMeasure.create);
  const pagination = usePagination({ pageSize: PAGE_SIZE });
  const { reset: resetPagination } = pagination;

  const [search, setSearch] = useState('');
  const debouncedSearch = useDebouncedValue(search);
  const [status, setStatus] = useState<StatusFilter>('');
  const [decimals, setDecimals] = useState('');
  const { deleteTarget, isDeleteOpen, openDelete, closeDelete } =
    useDeleteTarget<UnitOfMeasureRow>();

  useEffect(() => {
    resetPagination();
  }, [debouncedSearch, status, decimals, resetPagination]);

  const handleFilterChange = useCallback((id: string, value: string) => {
    if (id === 'status') {
      setStatus(toStatus(value));
    }
    if (id === 'decimals') {
      setDecimals(value);
    }
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearch('');
    setStatus('');
    setDecimals('');
  }, []);

  const handleDelete = useCallback((row: UnitOfMeasureRow) => {
    openDelete(row);
  }, []);

  const query = useUnitsOfMeasureList({
    q: debouncedSearch.trim() || undefined,
    isActive: status === '' ? undefined : status === 'true',
    decimalPlaces: decimals === '' ? undefined : Number(decimals),
  });
  const remove = useDeleteUnitOfMeasure();
  const formDialog = useUnitOfMeasureFormDialog();
  const { openEdit } = formDialog;

  const columns = useMemo(
    () =>
      getUnitOfMeasureColumns({
        t,
        can,
        onEdit: openEdit,
        onDelete: handleDelete,
      }),
    [t, can, openEdit, handleDelete],
  );

  const filters: ResolvedTableFilter[] = useMemo(
    () => [
      {
        id: 'status',
        label: t('unitsOfMeasure.col.status'),
        options: [
          { value: 'true', label: t('unitsOfMeasure.status.active') },
          { value: 'false', label: t('unitsOfMeasure.status.inactive') },
        ],
      },
      {
        id: 'decimals',
        label: t('unitsOfMeasure.list.decimalsFilter'),
        options: DECIMAL_PLACES_OPTIONS.map((value) => ({
          value,
          label: value,
        })),
      },
    ],
    [t],
  );

  const rows = useMemo(() => query.data ?? [], [query.data]);

  const exportColumns = useMemo(() => getUnitOfMeasureExportColumns(t), [t]);
  const excel = useExcelExport({
    fileName: 'units-of-measure',
    sheetName: t('unitsOfMeasure.title'),
    columns: exportColumns,
    load: () => rows,
  });

  // Clamp so a shrinking list (delete on the last page, refetch) never
  // leaves the pager on a page that no longer exists.
  const pageCount = Math.max(1, Math.ceil(rows.length / PAGE_SIZE));
  const page = Math.min(pagination.page, pageCount - 1);

  const pageItems = useMemo(
    () => rows.slice(page * PAGE_SIZE, page * PAGE_SIZE + PAGE_SIZE),
    [rows, page],
  );

  return {
    dir: directionOf(i18n.language),
    canCreate,
    formDialog,
    exportExcel: {
      onExport: excel.exportExcel,
      isExporting: excel.isExporting,
      disabled: rows.length === 0,
    },
    toolbar: {
      search,
      onSearchChange: setSearch,
      searchPlaceholder: t('unitsOfMeasure.list.searchPlaceholder'),
      filters,
      filterValues: { status, decimals },
      onFilterChange: handleFilterChange,
      onClearFilters: handleClearFilters,
      isDirty: search !== '' || status !== '' || decimals !== '',
    },
    table: {
      columns,
      data: pageItems,
      getRowId: getUnitOfMeasureRowId,
      isLoading: query.isLoading,
      isError: query.isError,
      errorLabel: t('common.loadError'),
      onRetry: () => {
        void query.refetch();
      },
      serverPagination: {
        ...pagination.toTablePagination(rows.length),
        page,
      },
      noResultsLabel: t('unitsOfMeasure.list.empty'),
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
          },
        });
      },
    },
  };
}
