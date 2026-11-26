import type { useTranslation as useTranslationType } from 'react-i18next';
import type { CanCheck } from '@/components/auth/can';
import { DataBadge } from '@/components/table/data-badge';
import { DataTableRowActions } from '@/components/table/data-table-row-actions';
import { Warehouse } from '@/lib/icons';
import type { WarehouseResponse } from '@/types/api/warehouses';
import type { Column } from '@/types/table';
import { formatPlainNumber } from '@/utils/format';
import { activeBadge } from '@/utils/status-tones';
import { getWarehouseRowActions } from '../hooks/warehouse-actions';
import { warehouseTypeLabelKey } from '../utils/warehouse-status';
import { WarehouseManager } from './warehouse-manager';

type TFn = ReturnType<typeof useTranslationType>['t'];

interface GetWarehouseColumnsArgs {
  t: TFn;
  /** From `useCan()`: the row menu shows only what the user may do. */
  can: CanCheck;
  onView: (row: WarehouseResponse) => void;
  onEdit: (row: WarehouseResponse) => void;
  onDelete: (row: WarehouseResponse) => void;
}

export function getWarehouseColumns({
  t,
  can,
  onView,
  onEdit,
  onDelete,
}: GetWarehouseColumnsArgs): Column<WarehouseResponse>[] {
  return [
    {
      id: 'code',
      header: t('warehouses.col.code'),
      accessor: (row) => row.code,
      cell: (row) => (
        <span className="text-table-id text-text-primary" dir="ltr">
          {row.code?.trim() || '—'}
        </span>
      ),
    },
    {
      id: 'name',
      header: t('warehouses.col.name'),
      accessor: (row) => row.name?.trim() || '—',
      cell: (row) => (
        <span className="gap-inline flex min-w-0 items-center">
          <span
            aria-hidden
            className="bg-brand-tint text-brand-text inline-flex size-9 shrink-0 items-center justify-center rounded-(--radius-control)"
          >
            <Warehouse className="size-4" />
          </span>
          <span className="text-text-primary text-h5 truncate">
            {row.name?.trim() || '—'}
          </span>
        </span>
      ),
    },
    {
      id: 'address',
      header: t('warehouses.col.address'),
      accessor: (row) => row.address?.trim() || '—',
      cellClassName: 'max-w-xs truncate',
    },
    {
      id: 'manager',
      header: t('warehouses.col.manager'),
      accessor: (row) =>
        row.managerName?.trim() ||
        row.managerUserId ||
        row.managerEmployeeId ||
        '—',
      cell: (row) => <WarehouseManager warehouse={row} />,
    },
    {
      id: 'members',
      header: t('warehouses.col.members'),
      accessor: (row) => formatPlainNumber(row.memberCount),
      cellClassName: 'text-h5 text-text-primary tabular-nums',
    },
    {
      id: 'locations',
      header: t('warehouses.col.locations'),
      accessor: (row) => formatPlainNumber(row.locationCount),
      cellClassName: 'text-h5 text-text-primary tabular-nums',
    },
    {
      id: 'type',
      header: t('warehouses.col.type'),
      accessor: (row) => t(warehouseTypeLabelKey(row.isTransit)),
      cellClassName: 'text-text-secondary',
    },
    {
      id: 'status',
      header: t('warehouses.col.status'),
      accessor: (row) => row.isActive,
      cell: (row) => {
        const badge = activeBadge(row.isActive);
        return (
          <DataBadge tone={badge.tone} shape="pill">
            {t(badge.labelKey)}
          </DataBadge>
        );
      },
    },
    {
      id: 'actions',
      header: t('warehouses.col.actions'),
      align: 'end',
      cell: (row) => (
        <DataTableRowActions
          actions={getWarehouseRowActions({
            t,
            can,
            row,
            onView,
            onEdit,
            onDelete,
          })}
        />
      ),
    },
  ];
}
