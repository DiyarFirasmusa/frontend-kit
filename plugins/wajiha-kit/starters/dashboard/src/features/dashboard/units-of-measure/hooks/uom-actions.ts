import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS } from '@/constants/permissions';
import { Pencil, Trash2 } from '@/lib/icons';
import { hasPermission } from '@/store/permission-store';
import type { UnitOfMeasureRow } from '../types/types';

export function canEditUnitOfMeasure(): boolean {
  return hasPermission(PERMS.unitOfMeasure.write);
}

export function canDeleteUnitOfMeasure(): boolean {
  return hasPermission(PERMS.unitOfMeasure.delete);
}

interface GetUnitOfMeasureRowActionsArgs {
  t: (key: string) => string;
  row: UnitOfMeasureRow;
  onEdit: (row: UnitOfMeasureRow) => void;
  onDelete: (row: UnitOfMeasureRow) => void;
}

export function getUnitOfMeasureRowActions({
  t,
  row,
  onEdit,
  onDelete,
}: GetUnitOfMeasureRowActionsArgs): RowAction[] {
  const actions: RowAction[] = [];

  if (canEditUnitOfMeasure()) {
    actions.push({
      id: 'edit',
      label: t('unitsOfMeasure.actions.edit'),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }

  if (canDeleteUnitOfMeasure()) {
    actions.push({
      id: 'delete',
      label: t('unitsOfMeasure.actions.delete'),
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
