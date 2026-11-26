import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import { PERMS } from '@/constants/permissions';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import { useListExport } from '@/hooks/use-list-export';
import { useClampPage } from '@/hooks/use-list-search';
import { toTableStatus } from '@/utils/table-state';
import { getUnitOfMeasureColumns } from '../components/uom-columns';
import { fetchUnitsOfMeasure } from '../services/units-of-measure.service';
import type { UnitOfMeasureRow } from '../types/types';
import { toUnitOfMeasureListParams } from '../utils/list-params';
import { getUnitOfMeasureExportColumns } from '../utils/uom-export-columns';
import { useUnitOfMeasureFilters } from './filter/use-uom-filters';
import type { UnitOfMeasureDialogState } from './form/use-uom-form-dialog';
import { useUnitsOfMeasureList } from './query/use-units-of-measure-list';
import { useDeleteUnitOfMeasure } from './query/use-uom-mutations';
import { getUnitOfMeasureRowActions } from './uom-actions';

const NO_ROWS: UnitOfMeasureRow[] = [];

export function getUnitOfMeasureRowId(row: UnitOfMeasureRow): string {
  return row.id;
}

/** Everything the units of measure list needs; the container only renders it. */
export function useUnitsOfMeasureListPage() {
  const { t } = useTranslation();
  const can = useCan();
  const filters = useUnitOfMeasureFilters();
  const params = toUnitOfMeasureListParams(filters.search);
  const query = useUnitsOfMeasureList(params);
  const [dialog, setDialog] = useState<UnitOfMeasureDialogState>({
    kind: 'closed',
  });
  const remove = useDeleteDialog(
    useDeleteUnitOfMeasure(),
    (row: UnitOfMeasureRow) => row.name ?? row.code ?? '',
  );
  const { openDelete } = remove;

  const getActions = useCallback(
    (row: UnitOfMeasureRow) =>
      getUnitOfMeasureRowActions(row, {
        t,
        can,
        onEdit: (target) => {
          setDialog({ kind: 'edit', unitId: target.id });
        },
        onDelete: openDelete,
      }),
    [t, can, openDelete],
  );
  const columns = useMemo(
    () => getUnitOfMeasureColumns({ t, getActions }),
    [t, getActions],
  );

  useClampPage(filters.search.page, query.data?.totalPages, filters.goToPage);

  const exportColumns = useMemo(() => getUnitOfMeasureExportColumns(t), [t]);
  const exportExcel = useListExport({
    fileName: 'units-of-measure',
    sheetName: t('unitsOfMeasure.title'),
    columns: exportColumns,
    params,
    fetchAll: fetchUnitsOfMeasure,
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
    canCreate: can(PERMS.unitOfMeasure.create),
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
