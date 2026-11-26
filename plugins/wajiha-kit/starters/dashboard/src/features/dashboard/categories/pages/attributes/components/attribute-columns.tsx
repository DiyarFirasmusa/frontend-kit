import { createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { DataBadge } from '@/components/table/data-badge';
import {
  DataTableRowActions,
  type RowAction,
} from '@/components/table/data-table-row-actions';
import type { DataTableFeatures } from '@/components/table/table-features';
import { activeBadge } from '@/utils/status-tones';
import type { AttributeRow } from '../../../types/types';

const helper = createColumnHelper<DataTableFeatures, AttributeRow>();

interface AttributeColumnsDeps {
  t: TFunction;
  getActions: (row: AttributeRow) => RowAction[];
}

/**
 * Column ids that sort are the backend's sort keys (`name`, `code`,
 * `dataType`), so the URL sort maps straight through.
 */
export function getAttributeColumns({ t, getActions }: AttributeColumnsDeps) {
  return helper.columns([
    helper.accessor('name', {
      id: 'name',
      header: t('categories.attributes.col.name'),
      cell: ({ getValue }) => (
        <span className="text-text-primary text-h5">
          {getValue()?.trim() || '—'}
        </span>
      ),
    }),
    helper.accessor('code', {
      id: 'code',
      header: t('categories.attributes.col.code'),
      cell: ({ getValue }) => (
        <span className="text-table-id text-text-primary" dir="ltr">
          {getValue()?.trim() || '—'}
        </span>
      ),
    }),
    helper.accessor('dataType', {
      id: 'dataType',
      header: t('categories.attributes.col.dataType'),
      cell: ({ getValue }) => {
        const type = getValue();
        return type ? t(`enums.AttributeDataType.${type}`) : '—';
      },
    }),
    helper.accessor('unitLabel', {
      header: t('categories.attributes.col.unit'),
      enableSorting: false,
      cell: ({ getValue }) => getValue()?.trim() || '—',
      meta: { hideBelow: 'md' },
    }),
    helper.display({
      id: 'options',
      enableSorting: false,
      header: t('categories.attributes.col.options'),
      cell: ({ row }) =>
        row.original.dataType === 'OPTION'
          ? (row.original.options?.length ?? 0)
          : '—',
      meta: { hideBelow: 'lg' },
    }),
    helper.accessor('isActive', {
      id: 'status',
      header: t('categories.attributes.col.status'),
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
