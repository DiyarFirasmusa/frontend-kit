import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS } from '@/constants/permissions';
import { Pencil, SlidersHorizontal, Trash2 } from '@/lib/icons';
import { hasPermission } from '@/store/permission-store';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';

export function canReadAttribute(): boolean {
  return hasPermission(PERMS.attributeDefinition.read);
}

export function canWriteAttribute(): boolean {
  return hasPermission(PERMS.attributeDefinition.write);
}

export function canDeleteAttribute(): boolean {
  return hasPermission(PERMS.attributeDefinition.delete);
}

export function isOptionAttribute(
  attribute: Pick<AttributeDefinitionResponse, 'dataType'>,
): boolean {
  return attribute.dataType === 'OPTION';
}

export function canEditAttributeOptions(
  attribute: AttributeDefinitionResponse,
): boolean {
  return canWriteAttribute() && isOptionAttribute(attribute);
}

interface GetAttributeRowActionsArgs {
  t: (key: string) => string;
  row: AttributeDefinitionResponse;
  canWrite: boolean;
  canDelete: boolean;
  onEdit: (row: AttributeDefinitionResponse) => void;
  onEditOptions: (row: AttributeDefinitionResponse) => void;
  onDelete: (row: AttributeDefinitionResponse) => void;
}

export function getAttributeRowActions({
  t,
  row,
  canWrite,
  canDelete,
  onEdit,
  onEditOptions,
  onDelete,
}: GetAttributeRowActionsArgs): RowAction[] {
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

  if (canWrite && isOptionAttribute(row)) {
    actions.push({
      id: 'options',
      label: t('categories.assignments.editOptions'),
      icon: SlidersHorizontal,
      onSelect: () => {
        onEditOptions(row);
      },
    });
  }

  if (canDelete) {
    actions.push({
      id: 'delete',
      label: t('common.delete'),
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
