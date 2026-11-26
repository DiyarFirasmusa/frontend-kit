import type { CanCheck } from '@/components/auth/can';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS } from '@/constants/permissions';
import { Eye, Pencil, Trash2 } from '@/lib/icons';
import type { WarehouseResponse } from '@/types/api/warehouses';

interface GetWarehouseRowActionsArgs {
  t: (key: string) => string;
  /** From `useCan()`, so the menu follows permission changes. */
  can: CanCheck;
  row: WarehouseResponse;
  onView: (row: WarehouseResponse) => void;
  onEdit: (row: WarehouseResponse) => void;
  onDelete: (row: WarehouseResponse) => void;
}

export function getWarehouseRowActions({
  t,
  can,
  row,
  onView,
  onEdit,
  onDelete,
}: GetWarehouseRowActionsArgs): RowAction[] {
  const actions: RowAction[] = [
    {
      id: 'view',
      label: t('warehouses.actions.view'),
      icon: Eye,
      onSelect: () => {
        onView(row);
      },
    },
  ];

  if (can(PERMS.warehouse.update)) {
    actions.push({
      id: 'edit',
      label: t('warehouses.actions.edit'),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }

  if (can(PERMS.warehouse.delete)) {
    actions.push({
      id: 'delete',
      label: t('warehouses.actions.delete'),
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
