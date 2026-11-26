import { useCallback, useState } from 'react';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import type { AssignmentRow, CategoryRow } from '../types/types';
import {
  getCategoryPath,
  getChildCount,
  isCategoryInUse,
} from '../utils/category-tree';
import type { CategoryDialogState } from './form/use-category-form-dialog';
import {
  useDeleteCategory,
  useDetachCategoryAttribute,
  useUpdateCategory,
} from './query/use-category-mutations';

interface UseCategoryDialogsOptions {
  /** The whole tree. */
  categories: CategoryRow[];
  selectedId: string | null;
  canUpdate: boolean;
  /** Called with the id of a category that was just created. */
  onCreated: (id: string) => void;
  /** Called when the selected category was deleted, before the lists refetch. */
  onSelectedDeleted: () => void;
}

/** The payload that sets only a category's active flag, keeping the rest. */
function toActivePayload(category: CategoryRow, isActive: boolean) {
  return {
    code: category.code ?? '',
    name: category.name ?? '',
    parentId: category.parentId ?? undefined,
    isActive,
  };
}

/**
 * Which dialog is open (one union) and the flows behind them: delete a
 * category (or the "in use" dialog that offers deactivating instead), detach
 * an attribute, and the openers the tree and the assignment table call.
 */
export function useCategoryDialogs({
  categories,
  selectedId,
  canUpdate,
  onCreated,
  onSelectedDeleted,
}: UseCategoryDialogsOptions) {
  const [dialog, setDialog] = useState<CategoryDialogState>({ kind: 'closed' });
  const closeDialog = useCallback(() => {
    setDialog({ kind: 'closed' });
  }, []);

  // Stable: the assignment columns are memoised on it.
  const openOptions = useCallback((attributeId: string) => {
    setDialog({ kind: 'options', attributeId });
  }, []);

  const update = useUpdateCategory();
  const removeCategory = useDeleteDialog(
    useDeleteCategory((id) => {
      if (id === selectedId) {
        onSelectedDeleted();
      }
    }),
    (category: CategoryRow) => category.name ?? '',
  );
  const detach = useDeleteDialog(
    useDetachCategoryAttribute(selectedId ?? ''),
    (row: AssignmentRow) => row.attributeName ?? '',
  );
  const { openDelete: openDeleteCategory } = removeCategory;

  /** A category in use cannot be deleted: say why instead of asking. */
  const requestDelete = (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category) {
      return;
    }
    if (isCategoryInUse(category, categories)) {
      setDialog({ kind: 'blocked', categoryId: id });
      return;
    }
    openDeleteCategory(category);
  };

  const setActive = (category: CategoryRow, isActive: boolean) => {
    update.mutate({
      id: category.id,
      payload: toActivePayload(category, isActive),
    });
  };

  const blocked =
    dialog.kind === 'blocked'
      ? (categories.find((category) => category.id === dialog.categoryId) ??
        null)
      : null;

  return {
    dialog,
    closeDialog,
    openCreate: () => {
      setDialog({ kind: 'create', parentId: selectedId ?? '' });
    },
    openEdit: (categoryId: string) => {
      setDialog({ kind: 'edit', categoryId });
    },
    openMove: (categoryId: string) => {
      setDialog({ kind: 'move', categoryId });
    },
    openOptions,
    openAttach: () => {
      setDialog({ kind: 'attach' });
    },
    openDetach: detach.openDelete,
    requestDelete,
    setActive,
    /** After a save: a new category becomes the selection. */
    onCategorySaved: (id: string) => {
      if (dialog.kind === 'create') {
        onCreated(id);
      }
      closeDialog();
    },
    deleteCategoryDialog: removeCategory.dialog,
    detachDialog: detach.dialog,
    blockedDialog: {
      open: blocked !== null,
      onOpenChange: (open: boolean) => {
        if (!open) {
          closeDialog();
        }
      },
      categoryName: blocked?.name ?? '',
      itemCount:
        typeof blocked?.itemCount === 'number' ? blocked.itemCount : null,
      childCount: blocked ? getChildCount(blocked, categories) : null,
      isActive: blocked?.isActive !== false,
      categoryPath: blocked ? getCategoryPath(blocked.id, categories) : '',
      canDeactivate:
        canUpdate && blocked !== null && blocked.isActive !== false,
      isPending: update.isPending,
      onDeactivate: () => {
        if (blocked === null || update.isPending) {
          return;
        }
        update.mutate(
          { id: blocked.id, payload: toActivePayload(blocked, false) },
          { onSuccess: closeDialog },
        );
      },
    },
  };
}
