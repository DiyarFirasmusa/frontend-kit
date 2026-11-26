import type { CanCheck } from '@/components/auth/can';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS } from '@/constants/permissions';
import { Pencil, Trash2 } from '@/lib/icons';
import type { UnitOfMeasureRow } from '../types/types';

interface GetUnitOfMeasureRowActionsArgs {
  t: (key: string) => string;
  /** From `useCan()`, so the menu follows permission changes. */
  can: CanCheck;
  row: UnitOfMeasureRow;
  onEdit: (row: UnitOfMeasureRow) => void;
  onDelete: (row: UnitOfMeasureRow) => void;
}

export function getUnitOfMeasureRowActions({
  t,
  can,
  row,
  onEdit,
  onDelete,
}: GetUnitOfMeasureRowActionsArgs): RowAction[] {
  const actions: RowAction[] = [];

  if (can(PERMS.unitOfMeasure.update)) {
    actions.push({
      id: 'edit',
      label: t('unitsOfMeasure.actions.edit'),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }

  if (can(PERMS.unitOfMeasure.delete)) {
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
