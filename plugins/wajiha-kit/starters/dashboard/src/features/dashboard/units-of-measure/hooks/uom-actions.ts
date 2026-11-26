import type { TFunction } from 'i18next';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS, type Permission } from '@/constants/permissions';
import { Pencil, Trash2 } from '@/lib/icons';
import type { UnitOfMeasureRow } from '../types/types';

interface UnitOfMeasureActionDeps {
  t: TFunction;
  /** From `useCan()`: reactive, so the actions follow a permission change. */
  can: (permission: Permission) => boolean;
  onEdit: (row: UnitOfMeasureRow) => void;
  onDelete: (row: UnitOfMeasureRow) => void;
}

/**
 * The row's actions. No permission: not rendered. Allowed but refused for
 * this row (a unit used by items cannot be deleted): rendered with the
 * reason, and selecting it does nothing (data-tables.md).
 */
export function getUnitOfMeasureRowActions(
  row: UnitOfMeasureRow,
  { t, can, onEdit, onDelete }: UnitOfMeasureActionDeps,
): RowAction[] {
  const name = row.name ?? row.code ?? '';
  const actions: RowAction[] = [];
  if (can(PERMS.unitOfMeasure.update)) {
    actions.push({
      id: 'edit',
      label: t('unitsOfMeasure.actions.editRow', { name }),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }
  if (can(PERMS.unitOfMeasure.delete)) {
    actions.push({
      id: 'delete',
      label: t('unitsOfMeasure.actions.deleteRow', { name }),
      icon: Trash2,
      variant: 'destructive',
      separatorBefore: actions.length > 0,
      disabledReason:
        row.inUse === true
          ? t('unitsOfMeasure.actions.deleteBlocked')
          : undefined,
      onSelect: () => {
        onDelete(row);
      },
    });
  }
  return actions;
}
