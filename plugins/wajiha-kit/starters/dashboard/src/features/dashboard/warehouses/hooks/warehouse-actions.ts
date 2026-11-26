import type { TFunction } from 'i18next';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS, type Permission } from '@/constants/permissions';
import { Eye, Pencil, Trash2 } from '@/lib/icons';
import type { WarehouseRow } from '../types/types';

interface WarehouseActionDeps {
  t: TFunction;
  /** From `useCan()`: reactive, so the actions follow a permission change. */
  can: (permission: Permission) => boolean;
  onView: (row: WarehouseRow) => void;
  onEdit: (row: WarehouseRow) => void;
  onDelete: (row: WarehouseRow) => void;
}

/**
 * The row's actions. View is always there (the route guard already required
 * the view permission). No permission: not rendered. Allowed but refused for
 * this row (a warehouse with locations cannot be deleted): rendered with the
 * reason, and selecting it does nothing (data-tables.md).
 */
export function getWarehouseRowActions(
  row: WarehouseRow,
  { t, can, onView, onEdit, onDelete }: WarehouseActionDeps,
): RowAction[] {
  const name = row.name ?? row.code ?? '';
  const actions: RowAction[] = [
    {
      id: 'view',
      label: t('warehouses.actions.viewRow', { name }),
      icon: Eye,
      onSelect: () => {
        onView(row);
      },
    },
  ];
  if (can(PERMS.warehouse.update)) {
    actions.push({
      id: 'edit',
      label: t('warehouses.actions.editRow', { name }),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }
  if (can(PERMS.warehouse.delete)) {
    actions.push({
      id: 'delete',
      label: t('warehouses.actions.deleteRow', { name }),
      icon: Trash2,
      variant: 'destructive',
      separatorBefore: true,
      disabledReason:
        (row.locationCount ?? 0) > 0
          ? t('warehouses.actions.deleteBlocked')
          : undefined,
      onSelect: () => {
        onDelete(row);
      },
    });
  }
  return actions;
}
