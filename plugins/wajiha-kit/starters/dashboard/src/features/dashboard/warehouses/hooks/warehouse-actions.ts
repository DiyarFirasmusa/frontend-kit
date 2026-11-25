import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS } from '@/constants/permissions';
import { Eye, Pencil, Trash2 } from '@/lib/icons';
import { hasPermission } from '@/store/permission-store';
import type { WarehouseResponse } from '@/types/api/warehouses';

export function canEditWarehouse(): boolean {
  return hasPermission(PERMS.warehouse.write);
}

export function canDeleteWarehouse(): boolean {
  return hasPermission(PERMS.warehouse.delete);
}

interface GetWarehouseRowActionsArgs {
  t: (key: string) => string;
  row: WarehouseResponse;
  onView: (row: WarehouseResponse) => void;
  onEdit: (row: WarehouseResponse) => void;
  onDelete: (row: WarehouseResponse) => void;
}

export function getWarehouseRowActions({
  t,
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

  if (canEditWarehouse()) {
    actions.push({
      id: 'edit',
      label: t('warehouses.actions.edit'),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }

  if (canDeleteWarehouse()) {
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
