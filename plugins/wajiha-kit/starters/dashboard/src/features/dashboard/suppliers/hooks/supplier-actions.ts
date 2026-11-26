import type { TFunction } from 'i18next';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS, type Permission } from '@/constants/permissions';
import { Pencil, Trash2 } from '@/lib/icons';
import type { SupplierRow } from '../types/types';

interface SupplierActionDeps {
  t: TFunction;
  /** From `useCan()`: reactive, so the actions follow a permission change. */
  can: (permission: Permission) => boolean;
  onEdit: (row: SupplierRow) => void;
  onDelete: (row: SupplierRow) => void;
}

/**
 * The row's actions. No permission: not rendered. Allowed but refused for
 * this row (a supplier on documents cannot be deleted): rendered with the
 * reason, and selecting it does nothing (data-tables.md).
 */
export function getSupplierRowActions(
  row: SupplierRow,
  { t, can, onEdit, onDelete }: SupplierActionDeps,
): RowAction[] {
  const name = row.name ?? row.code ?? '';
  const actions: RowAction[] = [];
  if (can(PERMS.supplier.update)) {
    actions.push({
      id: 'edit',
      label: t('suppliers.actions.editRow', { name }),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }
  if (can(PERMS.supplier.delete)) {
    actions.push({
      id: 'delete',
      label: t('suppliers.actions.deleteRow', { name }),
      icon: Trash2,
      variant: 'destructive',
      separatorBefore: actions.length > 0,
      disabledReason:
        row.inUse === true ? t('suppliers.actions.deleteBlocked') : undefined,
      onSelect: () => {
        onDelete(row);
      },
    });
  }
  return actions;
}
