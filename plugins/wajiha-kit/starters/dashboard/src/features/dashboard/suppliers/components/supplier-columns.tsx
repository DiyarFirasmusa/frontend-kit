import type { useTranslation as useTranslationType } from 'react-i18next';
import { DataBadge } from '@/components/table/data-badge';
import { DataTableRowActions } from '@/components/table/data-table-row-actions';
import type { Column } from '@/types/table';
import { getSupplierRowActions } from '../hooks/supplier-actions';
import type { SupplierRow } from '../types/types';
import { supplierStatusBadge } from '../utils/supplier-status';

type TFn = ReturnType<typeof useTranslationType>['t'];

interface GetSupplierColumnsArgs {
  t: TFn;
  canWrite: boolean;
  canDelete: boolean;
  onEdit: (row: SupplierRow) => void;
  onRegister: (row: SupplierRow) => void;
  onRemove: (row: SupplierRow) => void;
}

const text = (value: string | null | undefined) => value?.trim() || '—';

export function getSupplierColumns({
  t,
  canWrite,
  canDelete,
  onEdit,
  onRegister,
  onRemove,
}: GetSupplierColumnsArgs): Column<SupplierRow>[] {
  return [
    {
      id: 'code',
      header: t('suppliers.columns.code'),
      accessor: (row) => text(row.code),
      cell: (row) => (
        <span className="text-table-id text-warning" dir="ltr">
          {text(row.code)}
        </span>
      ),
    },
    {
      id: 'name',
      header: t('suppliers.columns.name'),
      accessor: (row) => text(row.name),
      cell: (row) => (
        <span className="flex flex-col">
          <span className="text-text-primary">{text(row.name)}</span>
          {row.contactName?.trim() ? (
            <span className="text-b3 text-text-secondary">
              {row.contactName.trim()}
            </span>
          ) : null}
        </span>
      ),
    },
    {
      id: 'phone',
      header: t('suppliers.columns.phone'),
      accessor: (row) => text(row.phone),
      cell: (row) => <span dir="ltr">{text(row.phone)}</span>,
    },
    {
      id: 'email',
      header: t('suppliers.columns.email'),
      accessor: (row) => text(row.email),
      cell: (row) => <span dir="ltr">{text(row.email)}</span>,
    },
    {
      id: 'taxNumber',
      header: t('suppliers.columns.taxNumber'),
      accessor: (row) => text(row.taxNumber),
      cell: (row) => (
        <span dir="ltr" className="tabular-nums">
          {text(row.taxNumber)}
        </span>
      ),
    },
    {
      id: 'inUse',
      header: t('suppliers.columns.inUse'),
      accessor: (row) => row.inUse,
      cell: (row) =>
        row.inUse === true ? t('suppliers.inUse.yes') : t('suppliers.inUse.no'),
    },
    {
      id: 'status',
      header: t('suppliers.columns.status'),
      accessor: (row) => row.isActive,
      cell: (row) => {
        const badge = supplierStatusBadge(row);
        return (
          <DataBadge tone={badge.tone} shape="pill">
            {t(badge.labelKey)}
          </DataBadge>
        );
      },
    },
    {
      id: 'actions',
      header: '',
      align: 'end',
      cell: (row) => (
        <DataTableRowActions
          actions={getSupplierRowActions({
            t,
            row,
            canWrite,
            canDelete,
            onEdit,
            onRegister,
            onRemove,
          })}
        />
      ),
    },
  ];
}
