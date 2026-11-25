import type { useTranslation as useTranslationType } from 'react-i18next';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { Ban, Pencil, Plus, Trash2 } from '@/lib/icons';
import type {
  SupplierPayload,
  SupplierDeleteMode,
  SupplierRow,
} from '../types/types';
import {
  defaultSupplierForm,
  type SupplierValues,
} from '../validations/validations';

type TFn = ReturnType<typeof useTranslationType>['t'];

export function isRegisteredSupplier(row: SupplierRow): boolean {
  return row.registered !== false && typeof row.id === 'string';
}

/** Delete is refused for a supplier on documents, so the confirm deactivates it instead. */
export function getSupplierDeleteMode(row: SupplierRow): SupplierDeleteMode {
  return row.inUse === true ? 'deactivate' : 'delete';
}

export function canRemoveSupplier(
  row: SupplierRow,
  canWrite: boolean,
  canDelete: boolean,
): boolean {
  if (!isRegisteredSupplier(row)) {
    return false;
  }
  if (getSupplierDeleteMode(row) === 'deactivate') {
    return canWrite && row.isActive !== false;
  }
  return canDelete;
}

export function toSupplierFormValues(row: SupplierRow): SupplierValues {
  return {
    code: row.code ?? '',
    name: row.name ?? '',
    contactName: row.contactName ?? '',
    phone: row.phone ?? '',
    email: row.email ?? '',
    address: row.address ?? '',
    taxNumber: row.taxNumber ?? '',
    notes: row.notes ?? '',
    isActive: row.isActive ?? true,
  };
}

/** The create form for a name that only exists on documents. */
export function toRegisterFormValues(row: SupplierRow): SupplierValues {
  return {
    ...defaultSupplierForm,
    code: row.code ?? '',
    name: row.name ?? '',
  };
}

export function toSupplierPayload(values: SupplierValues): SupplierPayload {
  const optional = {
    contactName: values.contactName.trim(),
    phone: values.phone.trim(),
    email: values.email.trim(),
    address: values.address.trim(),
    taxNumber: values.taxNumber.trim(),
    notes: values.notes.trim(),
  };
  const payload: SupplierPayload = {
    code: values.code.trim(),
    name: values.name.trim(),
    isActive: values.isActive,
  };
  for (const [key, value] of Object.entries(optional)) {
    if (value !== '') {
      Object.assign(payload, { [key]: value });
    }
  }
  return payload;
}

interface GetSupplierRowActionsArgs {
  t: TFn;
  row: SupplierRow;
  canWrite: boolean;
  canDelete: boolean;
  onEdit: (row: SupplierRow) => void;
  onRegister: (row: SupplierRow) => void;
  onRemove: (row: SupplierRow) => void;
}

export function getSupplierRowActions({
  t,
  row,
  canWrite,
  canDelete,
  onEdit,
  onRegister,
  onRemove,
}: GetSupplierRowActionsArgs): RowAction[] {
  if (!isRegisteredSupplier(row)) {
    return canWrite
      ? [
          {
            id: 'register',
            label: t('suppliers.actions.register'),
            icon: Plus,
            onSelect: () => {
              onRegister(row);
            },
          },
        ]
      : [];
  }

  const actions: RowAction[] = [];
  if (canWrite) {
    actions.push({
      id: 'edit',
      label: t('common.edit'),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }
  if (canRemoveSupplier(row, canWrite, canDelete)) {
    const isDeactivate = getSupplierDeleteMode(row) === 'deactivate';
    actions.push({
      id: isDeactivate ? 'deactivate' : 'delete',
      label: isDeactivate
        ? t('suppliers.actions.deactivate')
        : t('common.delete'),
      icon: isDeactivate ? Ban : Trash2,
      variant: 'destructive',
      separatorBefore: true,
      onSelect: () => {
        onRemove(row);
      },
    });
  }
  return actions;
}
