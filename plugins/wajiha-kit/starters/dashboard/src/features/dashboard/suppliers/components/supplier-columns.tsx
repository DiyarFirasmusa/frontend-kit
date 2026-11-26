import { createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { DataBadge } from '@/components/table/data-badge';
import {
  DataTableRowActions,
  type RowAction,
} from '@/components/table/data-table-row-actions';
import type { DataTableFeatures } from '@/components/table/table-features';
import { activeBadge } from '@/utils/status-tones';
import type { SupplierRow } from '../types/types';

const helper = createColumnHelper<DataTableFeatures, SupplierRow>();

const text = (value: string | null | undefined): string => value?.trim() || '—';

interface SupplierColumnsDeps {
  t: TFunction;
  getActions: (row: SupplierRow) => RowAction[];
}

/**
 * Column ids that sort are the backend's sort keys (`code`, `name`), so the
 * URL sort maps straight through; everything else has sorting off.
 */
export function getSupplierColumns({ t, getActions }: SupplierColumnsDeps) {
  return helper.columns([
    helper.accessor('code', {
      id: 'code',
      header: t('suppliers.columns.code'),
      cell: ({ getValue }) => (
        <span className="text-table-id text-text-primary" dir="ltr">
          {text(getValue())}
        </span>
      ),
    }),
    helper.accessor('name', {
      id: 'name',
      header: t('suppliers.columns.name'),
      cell: ({ row }) => (
        <span className="flex flex-col">
          <span className="text-text-primary">{text(row.original.name)}</span>
          {row.original.contactName?.trim() ? (
            <span className="text-b3 text-text-secondary">
              {row.original.contactName.trim()}
            </span>
          ) : null}
        </span>
      ),
    }),
    helper.accessor('phone', {
      header: t('suppliers.columns.phone'),
      enableSorting: false,
      cell: ({ getValue }) => <span dir="ltr">{text(getValue())}</span>,
      meta: { hideBelow: 'md' },
    }),
    helper.accessor('email', {
      header: t('suppliers.columns.email'),
      enableSorting: false,
      cell: ({ getValue }) => <span dir="ltr">{text(getValue())}</span>,
      meta: { hideBelow: 'lg' },
    }),
    helper.accessor('inUse', {
      header: t('suppliers.columns.inUse'),
      enableSorting: false,
      cell: ({ getValue }) =>
        getValue() === true
          ? t('suppliers.inUse.yes')
          : t('suppliers.inUse.no'),
      meta: { hideBelow: 'lg' },
    }),
    helper.accessor('isActive', {
      id: 'status',
      header: t('suppliers.columns.status'),
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
