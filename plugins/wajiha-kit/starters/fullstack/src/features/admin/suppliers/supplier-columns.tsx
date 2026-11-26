import type { TFunction } from 'i18next';
import { DataBadge } from '@/components/table/data-badge';
import { DataTableRowActions } from '@/components/table/data-table-row-actions';
import { activeBadge } from '@/components/table/status-tones';
import type { Column } from '@/components/table/types';
import type { Locale } from '@/shared/lib/i18n/languages';
import { formatShortDate } from '../lib/format';
import type { Supplier } from '../types/api';
import { getSupplierRowActions } from './supplier-actions';

type ColumnArgs = {
  t: TFunction;
  locale: Locale;
  canWrite: boolean;
  canDelete: boolean;
  onEdit: (row: Supplier) => void;
  onDelete: (row: Supplier) => void;
};

const text = (value: string | null) => value?.trim() || '—';

export function getSupplierColumns({
  t,
  locale,
  canWrite,
  canDelete,
  onEdit,
  onDelete,
}: ColumnArgs): Column<Supplier>[] {
  const columns: Column<Supplier>[] = [
    {
      id: 'code',
      header: t('suppliers.columnCode'),
      accessor: (row) => row.code,
      cell: (row) => (
        <span className="text-table-id" dir="ltr">
          {row.code}
        </span>
      ),
    },
    {
      id: 'name',
      header: t('suppliers.columnName'),
      accessor: (row) => row.name,
      cell: (row) => (
        <span className="flex flex-col">
          <span className="text-text-primary">{row.name}</span>
          {row.contactName === null ? null : (
            <span className="text-b3 text-text-secondary">{row.contactName}</span>
          )}
        </span>
      ),
    },
    {
      id: 'phone',
      header: t('suppliers.columnPhone'),
      accessor: (row) => text(row.phone),
      cell: (row) => <span dir="ltr">{text(row.phone)}</span>,
    },
    {
      id: 'email',
      header: t('suppliers.columnEmail'),
      accessor: (row) => text(row.email),
      cell: (row) => <span dir="ltr">{text(row.email)}</span>,
    },
    {
      id: 'updatedAt',
      header: t('suppliers.columnUpdated'),
      accessor: (row) => row.updatedAt,
      cell: (row) => formatShortDate(row.updatedAt, locale),
    },
    {
      id: 'status',
      header: t('suppliers.columnStatus'),
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
  ];
  if (canWrite || canDelete) {
    columns.push({
      id: 'actions',
      header: <span className="sr-only">{t('ui.actions')}</span>,
      align: 'end',
      cell: (row) => (
        <DataTableRowActions
          actions={getSupplierRowActions({ t, row, canWrite, canDelete, onEdit, onDelete })}
        />
      ),
    });
  }
  return columns;
}
