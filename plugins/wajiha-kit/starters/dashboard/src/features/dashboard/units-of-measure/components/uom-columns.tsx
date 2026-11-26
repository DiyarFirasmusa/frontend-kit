import type { useTranslation as useTranslationType } from 'react-i18next';
import type { CanCheck } from '@/components/auth/can';
import { DataBadge } from '@/components/table/data-badge';
import { DataTableRowActions } from '@/components/table/data-table-row-actions';
import type { Column } from '@/types/table';
import { getUnitOfMeasureRowActions } from '../hooks/uom-actions';
import type { UnitOfMeasureRow } from '../types/types';
import { formatDecimalExample } from '../utils/decimal-example';
import { unitOfMeasureActiveBadge } from '../utils/uom-status';

type TFn = ReturnType<typeof useTranslationType>['t'];

interface GetUnitOfMeasureColumnsArgs {
  t: TFn;
  /** From `useCan()`: the row menu shows only what the user may do. */
  can: CanCheck;
  onEdit: (row: UnitOfMeasureRow) => void;
  onDelete: (row: UnitOfMeasureRow) => void;
}

export function getUnitOfMeasureColumns({
  t,
  can,
  onEdit,
  onDelete,
}: GetUnitOfMeasureColumnsArgs): Column<UnitOfMeasureRow>[] {
  return [
    {
      id: 'code',
      header: t('unitsOfMeasure.col.code'),
      accessor: (row) => row.code ?? '—',
      cellClassName: 'text-table-id text-text-primary',
    },
    {
      id: 'name',
      header: t('unitsOfMeasure.col.name'),
      accessor: (row) => row.name ?? '—',
    },
    {
      id: 'decimalPlaces',
      header: t('unitsOfMeasure.col.decimalPlaces'),
      accessor: (row) => row.decimalPlaces ?? '—',
      cellClassName: 'text-h5 tabular-nums',
    },
    {
      id: 'example',
      header: t('unitsOfMeasure.col.example'),
      accessor: (row) => formatDecimalExample(row.decimalPlaces),
      cellClassName: 'tabular-nums',
    },
    {
      id: 'status',
      header: t('unitsOfMeasure.col.status'),
      accessor: (row) => t(unitOfMeasureActiveBadge(row.isActive).labelKey),
      cell: (row) => {
        const badge = unitOfMeasureActiveBadge(row.isActive);
        return (
          <DataBadge tone={badge.tone} shape="pill">
            {t(badge.labelKey)}
          </DataBadge>
        );
      },
    },
    {
      id: 'actions',
      header: t('unitsOfMeasure.col.actions'),
      align: 'end',
      cell: (row) => (
        <DataTableRowActions
          actions={getUnitOfMeasureRowActions({
            t,
            can,
            row,
            onEdit,
            onDelete,
          })}
        />
      ),
    },
  ];
}
