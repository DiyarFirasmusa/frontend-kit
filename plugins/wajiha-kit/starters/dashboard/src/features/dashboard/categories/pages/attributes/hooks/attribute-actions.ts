import type { TFunction } from 'i18next';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS, type Permission } from '@/constants/permissions';
import { Pencil, SlidersHorizontal, Trash2 } from '@/lib/icons';
import type { AttributeRow } from '../../../types/types';

interface AttributeActionDeps {
  t: TFunction;
  /** From `useCan()`: reactive, so the actions follow a permission change. */
  can: (permission: Permission) => boolean;
  onEdit: (row: AttributeRow) => void;
  onEditOptions: (row: AttributeRow) => void;
  onDelete: (row: AttributeRow) => void;
}

/**
 * The row's actions. No permission: not rendered. The options editor exists
 * only for OPTION attributes.
 */
export function getAttributeRowActions(
  row: AttributeRow,
  { t, can, onEdit, onEditOptions, onDelete }: AttributeActionDeps,
): RowAction[] {
  const name = row.name ?? row.code ?? '';
  const canUpdate = can(PERMS.attributeDefinition.update);
  const actions: RowAction[] = [];
  if (canUpdate) {
    actions.push({
      id: 'edit',
      label: t('categories.attributes.actions.editRow', { name }),
      icon: Pencil,
      onSelect: () => {
        onEdit(row);
      },
    });
  }
  if (canUpdate && row.dataType === 'OPTION') {
    actions.push({
      id: 'options',
      label: t('categories.attributes.actions.optionsRow', { name }),
      icon: SlidersHorizontal,
      onSelect: () => {
        onEditOptions(row);
      },
    });
  }
  if (can(PERMS.attributeDefinition.delete)) {
    actions.push({
      id: 'delete',
      label: t('categories.attributes.actions.deleteRow', { name }),
      icon: Trash2,
      variant: 'destructive',
      separatorBefore: actions.length > 0,
      onSelect: () => {
        onDelete(row);
      },
    });
  }
  return actions;
}
