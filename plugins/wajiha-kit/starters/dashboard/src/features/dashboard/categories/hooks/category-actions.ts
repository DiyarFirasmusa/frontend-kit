import type { RowAction } from '@/components/table/data-table-row-actions';
import { PERMS } from '@/constants/permissions';
import { ArrowRightLong, Ban, Pencil, Trash2 } from '@/lib/icons';
import { hasPermission } from '@/store/permission-store';
import type {
  CategoryAttributeResponse,
  ItemCategoryResponse,
} from '@/types/api/catalog';

export function canReadCategory(): boolean {
  return hasPermission(PERMS.itemCategory.read);
}

export function canWriteCategory(): boolean {
  return hasPermission(PERMS.itemCategory.write);
}

export function canDeleteCategory(): boolean {
  return hasPermission(PERMS.itemCategory.delete);
}

export function canWriteAssignment(row: CategoryAttributeResponse): boolean {
  return canWriteCategory() && !row.inherited;
}

interface GetCategoryRowActionsArgs {
  t: (key: string) => string;
  category: ItemCategoryResponse;
  canWrite: boolean;
  canDelete: boolean;
  onEdit: (id: string) => void;
  onToggleActive: (id: string) => void;
  onMove: (id: string) => void;
  onDelete: (id: string) => void;
}

/** The "⋯" menu of a tree node (11.01): edit, disable / enable, move, delete. */
export function getCategoryRowActions({
  t,
  category,
  canWrite,
  canDelete,
  onEdit,
  onToggleActive,
  onMove,
  onDelete,
}: GetCategoryRowActionsArgs): RowAction[] {
  const actions: RowAction[] = [];
  if (canWrite) {
    actions.push(
      {
        id: 'edit',
        label: t('common.edit'),
        icon: Pencil,
        onSelect: () => {
          onEdit(category.id);
        },
      },
      {
        id: 'toggle',
        label:
          category.isActive === false
            ? t('categories.actions.enable')
            : t('categories.actions.disable'),
        icon: Ban,
        onSelect: () => {
          onToggleActive(category.id);
        },
      },
      {
        id: 'move',
        label: t('categories.actions.move'),
        icon: ArrowRightLong,
        onSelect: () => {
          onMove(category.id);
        },
      },
    );
  }
  if (canDelete) {
    actions.push({
      id: 'delete',
      label: t('common.delete'),
      icon: Trash2,
      variant: 'destructive',
      separatorBefore: actions.length > 0,
      onSelect: () => {
        onDelete(category.id);
      },
    });
  }
  return actions;
}
