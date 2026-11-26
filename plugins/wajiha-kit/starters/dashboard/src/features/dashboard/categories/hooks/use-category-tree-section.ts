import type { UseQueryResult } from '@tanstack/react-query';
import { useEffect, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import type { SelectOption } from '@/components/fields/select-option';
import type { RowAction } from '@/components/table/data-table-row-actions';
import type { ItemCategoryResponse } from '@/types/api/catalog';
import type { CategoryBlockedDialogProps } from '../components/dialog/category-blocked-dialog';
import type { CategoryFormDialogProps } from '../components/dialog/category-form-dialog';
import type { CategoryTreeNode } from '../types/types';
import {
  buildCategoryTree,
  filterCategoryTree,
  getCategoryPath,
  getChildCount,
  getDescendantIds,
  isCategoryInUse,
} from '../utils/category-tree';
import type { CategoryFormValues } from '../validations/validations';
import { toCategoryPayload } from '../validations/validations';
import { getCategoryAccess, getCategoryRowActions } from './category-actions';
import type { CategoriesConfirmTarget } from './confirm-target';
import { useCategoryFormDialog } from './form/use-category-form-dialog';
import {
  useCreateCategory,
  useDeleteCategory,
  useUpdateCategory,
} from './query/use-category-mutations';
import { useItemCategories } from './query/use-item-categories';

export interface CategoryTreeSection {
  query: UseQueryResult<ItemCategoryResponse[]>;
  categories: ItemCategoryResponse[];
  nodes: CategoryTreeNode[];
  search: string;
  setSearch: (value: string) => void;
  isSearching: boolean;
  selectedId: string | null;
  selectedCategory: ItemCategoryResponse | null;
  selectedPath: string;
  select: (id: string) => void;
  /** "All items" root row: no category selected, the root view is shown. */
  isAllSelected: boolean;
  selectAll: () => void;
  /** Sum of the root categories' item counts; null when the API sends none. */
  totalItemCount: number | null;
  getNodeActions: (id: string) => RowAction[];
  canWrite: boolean;
  canDelete: boolean;
  onAddCategory: () => void;
  onEditSelected: () => void;
  onMoveSelected: () => void;
  onDeleteSelected: () => void;
  removeCategory: (id: string, close: () => void) => void;
  isDeletingCategory: boolean;
  categoryDialog: CategoryFormDialogProps;
  blockedDialog: CategoryBlockedDialogProps;
}

export function useCategoryTreeSection({
  requestDelete,
}: {
  requestDelete: (target: CategoriesConfirmTarget) => void;
}): CategoryTreeSection {
  const { t } = useTranslation();
  const [search, setSearch] = useState('');
  const [pickedId, setSelectedId] = useState<string | null>(null);
  const [allSelected, setAllSelected] = useState(false);
  const [blockedId, setBlockedId] = useState<string | null>(null);

  const query = useItemCategories();
  const categories = useMemo(() => query.data ?? [], [query.data]);
  const categoriesLoaded = query.data !== undefined;

  const categoryDialog = useCategoryFormDialog();
  const createCategory = useCreateCategory();
  const updateCategory = useUpdateCategory();
  const deleteCategory = useDeleteCategory();

  useEffect(() => {
    if (
      categoriesLoaded &&
      pickedId !== null &&
      !categories.some((category) => category.id === pickedId)
    ) {
      setSelectedId(null);
    }
  }, [categoriesLoaded, categories, pickedId]);

  const nodes = useMemo(
    () => filterCategoryTree(buildCategoryTree(categories), search),
    [categories, search],
  );
  // Design 11.01 always shows a selected category: until the user picks one,
  // the first category of the tree is selected.
  const selectedId = allSelected ? null : (pickedId ?? nodes[0]?.id ?? null);
  const selectedCategory =
    categories.find((category) => category.id === selectedId) ?? null;
  const blockedCategory =
    categories.find((category) => category.id === blockedId) ?? null;

  const categoryId = categoryDialog.categoryId;
  const editingCategory =
    categories.find((category) => category.id === categoryId) ?? null;

  const parentOptions = useMemo<SelectOption[]>(() => {
    const excluded =
      categoryId === null
        ? new Set<string>()
        : new Set([categoryId, ...getDescendantIds(categoryId, categories)]);
    return [
      { value: '', label: t('categories.form.noParent') },
      ...categories
        .filter((category) => !excluded.has(category.id))
        .map((category) => ({
          value: category.id,
          label: getCategoryPath(category.id, categories),
        })),
    ];
  }, [categoryId, categories, t]);

  const onSubmitCategory = (values: CategoryFormValues) => {
    const payload = toCategoryPayload(
      values,
      categoryDialog.mode === 'create'
        ? null
        : editingCategory?.expiryAlertDays,
    );
    if (categoryDialog.mode === 'create') {
      createCategory.mutate(payload, {
        onSuccess: (created) => {
          categoryDialog.close();
          setAllSelected(false);
          setSelectedId(created.id);
        },
      });
      return;
    }
    if (categoryId !== null) {
      updateCategory.mutate(
        { id: categoryId, payload },
        {
          onSuccess: () => {
            categoryDialog.close();
          },
        },
      );
    }
  };

  const totalItemCount = useMemo(() => {
    const roots = categories.filter(
      (category) =>
        category.parentId === null ||
        category.parentId === undefined ||
        !categories.some((other) => other.id === category.parentId),
    );
    if (!roots.some((root) => typeof root.itemCount === 'number')) {
      return null;
    }
    return roots.reduce((sum, root) => sum + (root.itemCount ?? 0), 0);
  }, [categories]);

  const requestDeleteCategory = (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category) {
      return;
    }
    if (isCategoryInUse(category, categories)) {
      setBlockedId(category.id);
      return;
    }
    requestDelete({
      kind: 'category',
      id: category.id,
      name: category.name ?? '',
    });
  };

  const toggleActive = (id: string) => {
    const category = categories.find((item) => item.id === id);
    if (!category) {
      return;
    }
    updateCategory.mutate({
      id: category.id,
      payload: {
        code: category.code ?? '',
        name: category.name ?? '',
        parentId: category.parentId ?? undefined,
        isActive: category.isActive === false,
      },
    });
  };

  const access = getCategoryAccess(useCan());
  const canWrite = access.update;
  const canDelete = access.delete;

  const onDeactivateBlocked = () => {
    if (blockedCategory === null) {
      return;
    }
    updateCategory.mutate(
      {
        id: blockedCategory.id,
        payload: {
          code: blockedCategory.code ?? '',
          name: blockedCategory.name ?? '',
          parentId: blockedCategory.parentId ?? undefined,
          isActive: false,
        },
      },
      {
        onSuccess: () => {
          setBlockedId(null);
        },
      },
    );
  };

  return {
    query,
    categories,
    nodes,
    search,
    setSearch,
    isSearching: search.trim() !== '',
    selectedId,
    selectedCategory,
    selectedPath:
      selectedId === null ? '' : getCategoryPath(selectedId, categories),
    select: (id: string) => {
      setAllSelected(false);
      setSelectedId(id);
    },
    isAllSelected: allSelected,
    selectAll: () => {
      setAllSelected(true);
    },
    totalItemCount,
    getNodeActions: (id: string) => {
      const category = categories.find((item) => item.id === id);
      if (!category) {
        return [];
      }
      return getCategoryRowActions({
        t,
        category,
        canWrite,
        canDelete,
        onEdit: categoryDialog.openEdit,
        onToggleActive: toggleActive,
        onMove: categoryDialog.openMove,
        onDelete: requestDeleteCategory,
      });
    },
    canWrite,
    canDelete,
    onAddCategory: () => {
      categoryDialog.openCreate();
    },
    onEditSelected: () => {
      if (selectedId !== null) {
        categoryDialog.openEdit(selectedId);
      }
    },
    onMoveSelected: () => {
      if (selectedId !== null) {
        categoryDialog.openMove(selectedId);
      }
    },
    onDeleteSelected: () => {
      if (selectedId !== null) {
        requestDeleteCategory(selectedId);
      }
    },
    removeCategory: (id: string, close: () => void) => {
      deleteCategory.mutate(id, {
        onSuccess: () => {
          close();
          setSelectedId((current) => (current === id ? null : current));
        },
        onError: () => {
          close();
          setBlockedId(id);
        },
      });
    },
    isDeletingCategory: deleteCategory.isPending,
    categoryDialog: {
      open: categoryDialog.open,
      onOpenChange: categoryDialog.onOpenChange,
      mode: categoryDialog.mode,
      category: editingCategory,
      defaultParentId: selectedId ?? '',
      parentOptions,
      isPending: createCategory.isPending || updateCategory.isPending,
      onSubmit: onSubmitCategory,
    },
    blockedDialog: {
      open: blockedId !== null,
      onOpenChange: (open: boolean) => {
        if (!open) {
          setBlockedId(null);
        }
      },
      categoryName: blockedCategory?.name ?? '',
      itemCount:
        typeof blockedCategory?.itemCount === 'number'
          ? blockedCategory.itemCount
          : null,
      childCount:
        blockedCategory === null
          ? null
          : getChildCount(blockedCategory, categories),
      isActive: blockedCategory?.isActive !== false,
      categoryPath:
        blockedId === null ? '' : getCategoryPath(blockedId, categories),
      canDeactivate:
        blockedCategory !== null && blockedCategory.isActive !== false,
      isPending: updateCategory.isPending,
      onDeactivate: onDeactivateBlocked,
    },
  };
}
