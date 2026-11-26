import { Link } from '@tanstack/react-router';
import { createColumnHelper } from '@tanstack/react-table';
import type { TFunction } from 'i18next';
import { DataBadge } from '@/components/table/data-badge';
import {
  DataTableRowActions,
  type RowAction,
} from '@/components/table/data-table-row-actions';
import type { DataTableFeatures } from '@/components/table/table-features';
import { Warehouse } from '@/lib/icons';
import { formatPlainNumber } from '@/utils/format';
import { activeBadge } from '@/utils/status-tones';
import type { WarehouseRow } from '../types/types';
import { WarehouseManager } from './warehouse-manager';

const helper = createColumnHelper<DataTableFeatures, WarehouseRow>();

const text = (value: string | null | undefined): string => value?.trim() || '—';

interface WarehouseColumnsDeps {
  t: TFunction;
  getActions: (row: WarehouseRow) => RowAction[];
}

/**
 * Column ids that sort are the backend's sort keys (`code`, `name`,
 * `address`, `locationCount`, `memberCount`), so the URL sort maps straight
 * through; everything else has sorting off. The name is a real link to the
 * detail page (the row itself is not clickable).
 */
export function getWarehouseColumns({ t, getActions }: WarehouseColumnsDeps) {
  return helper.columns([
    helper.accessor('code', {
      id: 'code',
      header: t('warehouses.columns.code'),
      cell: ({ getValue }) => (
        <span className="text-table-id text-text-primary" dir="ltr">
          {text(getValue())}
        </span>
      ),
    }),
    helper.accessor('name', {
      id: 'name',
      header: t('warehouses.columns.name'),
      cell: ({ row }) => (
        <span className="gap-inline flex min-w-0 items-center">
          <span
            aria-hidden
            className="bg-brand-tint text-brand-text inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius-control)"
          >
            <Warehouse className="size-4" />
          </span>
          <Link
            to="/warehouses/$warehouseId"
            params={{ warehouseId: row.original.id }}
            className="text-text-primary text-h5 truncate hover:underline"
          >
            {text(row.original.name)}
          </Link>
        </span>
      ),
    }),
    helper.accessor('address', {
      id: 'address',
      header: t('warehouses.columns.address'),
      cell: ({ getValue }) => (
        <span className="block max-w-xs truncate">{text(getValue())}</span>
      ),
      meta: { hideBelow: 'lg' },
    }),
    helper.display({
      id: 'manager',
      header: t('warehouses.columns.manager'),
      enableSorting: false,
      cell: ({ row }) => <WarehouseManager warehouse={row.original} />,
      meta: { hideBelow: 'md' },
    }),
    helper.accessor('memberCount', {
      id: 'memberCount',
      header: t('warehouses.columns.members'),
      cell: ({ getValue }) => (
        <span className="text-h5 tabular-nums">
          {formatPlainNumber(getValue())}
        </span>
      ),
      meta: { hideBelow: 'lg' },
    }),
    helper.accessor('locationCount', {
      id: 'locationCount',
      header: t('warehouses.columns.locations'),
      cell: ({ getValue }) => (
        <span className="text-h5 tabular-nums">
          {formatPlainNumber(getValue())}
        </span>
      ),
      meta: { hideBelow: 'lg' },
    }),
    helper.accessor('isTransit', {
      id: 'type',
      header: t('warehouses.columns.type'),
      enableSorting: false,
      cell: ({ getValue }) => (
        <span className="text-text-secondary">
          {getValue() === true
            ? t('warehouses.type.transit')
            : t('warehouses.type.regular')}
        </span>
      ),
      meta: { hideBelow: 'md' },
    }),
    helper.accessor('isActive', {
      id: 'status',
      header: t('warehouses.columns.status'),
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
