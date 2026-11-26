import type { TFunction } from 'i18next';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { Pencil, Trash2 } from '@/components/ui/icons';
import type { Supplier, SupplierRequest } from '../types/api';
import type { SupplierValues } from './validations';

export function toSupplierFormValues(row: Supplier): SupplierValues {
  return {
    code: row.code,
    name: row.name,
    contactName: row.contactName ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    notes: row.notes ?? '',
    isActive: row.isActive,
  };
}

/** Trimmed values; empty optional fields are left out rather than sent as "". */
export function toSupplierPayload(values: SupplierValues): SupplierRequest {
  const payload: SupplierRequest = {
    code: values.code.trim(),
    name: values.name.trim(),
    isActive: values.isActive,
  };
  const optional = {
    contactName: values.contactName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    notes: values.notes.trim(),
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== '') {
      Object.assign(payload, { [key]: value });
    }
  }
  return payload;
}

type RowActionArgs = {
  t: TFunction;
  row: Supplier;
  canWrite: boolean;
  canDelete: boolean;
  onEdit: (row: Supplier) => void;
  onDelete: (row: Supplier) => void;
};

/** The actions a row offers, by permission. No permission, no button (the API still checks). */
export function getSupplierRowActions({
  t,
  row,
  canWrite,
  canDelete,
  onEdit,
  onDelete,
}: RowActionArgs): RowAction[] {
  const actions: RowAction[] = [];
  if (canWrite) {
    actions.push({
      id: 'edit',
      label: t('suppliers.edit'),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }
  if (canDelete) {
    actions.push({
      id: 'delete',
      label: t('suppliers.delete'),
      icon: Trash2,
      variant: 'destructive',
      separatorBefore: true,
      onSelect: () => {
        onDelete(row);
      },
    });
  }
  return actions;
}
