import { createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { DataBadge } from '@/components/table/data-badge';
import {
  DataTableRowActions,
  type RowAction,
} from '@/components/table/data-table-row-actions';
import type { DataTableFeatures } from '@/components/table/table-features';
import { activeBadge } from '@/utils/status-tones';
import type { UnitOfMeasureRow } from '../types/types';
import { formatDecimalExample } from '../utils/decimal-example';

const helper = createColumnHelper<DataTableFeatures, UnitOfMeasureRow>();

interface UnitOfMeasureColumnsDeps {
  t: TFunction;
  getActions: (row: UnitOfMeasureRow) => RowAction[];
}

/**
 * Column ids that sort are the backend's sort keys (`code`, `name`,
 * `decimalPlaces`), so the URL sort maps straight through.
 */
export function getUnitOfMeasureColumns({
  t,
  getActions,
}: UnitOfMeasureColumnsDeps) {
  return helper.columns([
    helper.accessor('code', {
      id: 'code',
      header: t('unitsOfMeasure.columns.code'),
      cell: ({ getValue }) => (
        <span className="text-table-id text-text-primary" dir="ltr">
          {getValue()?.trim() || '—'}
        </span>
      ),
    }),
    helper.accessor('name', {
      id: 'name',
      header: t('unitsOfMeasure.columns.name'),
      cell: ({ getValue }) => getValue()?.trim() || '—',
    }),
    helper.accessor('decimalPlaces', {
      id: 'decimalPlaces',
      header: t('unitsOfMeasure.columns.decimalPlaces'),
      cell: ({ getValue }) => (
        <span className="tabular-nums">{getValue() ?? '—'}</span>
      ),
    }),
    helper.display({
      id: 'example',
      enableSorting: false,
      header: t('unitsOfMeasure.columns.example'),
      cell: ({ row }) => (
        <span className="tabular-nums" dir="ltr">
          {formatDecimalExample(row.original.decimalPlaces)}
        </span>
      ),
      meta: { hideBelow: 'md' },
    }),
    helper.accessor('inUse', {
      header: t('unitsOfMeasure.columns.inUse'),
      enableSorting: false,
      cell: ({ getValue }) =>
        getValue() === true
          ? t('unitsOfMeasure.inUse.yes')
          : t('unitsOfMeasure.inUse.no'),
      meta: { hideBelow: 'lg' },
    }),
    helper.accessor('isActive', {
      id: 'status',
      header: t('unitsOfMeasure.columns.status'),
      enableSorting: false,
      cell: ({ getValue }) => {
        const badge = activeBadge(getValue());
        return (
          <DataBadge tone={badge.tone} shape="pill">
            {t(badge.labelKey)}
          </DataBadge>
        );
      },
    }),
    helper.display({
      id: 'actions',
      enableSorting: false,
      header: () => <span className="sr-only">{t('common.actions')}</span>,
      cell: ({ row }) => (
        <DataTableRowActions actions={getActions(row.original)} />
      ),
      meta: { align: 'end' },
    }),
  ]);
}
