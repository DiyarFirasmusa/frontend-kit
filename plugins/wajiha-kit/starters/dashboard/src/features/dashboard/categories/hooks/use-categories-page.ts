import { useCallback, useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { useDeleteDialog } from '@/hooks/use-delete-dialog';
import { useExcelExport } from '@/hooks/use-excel-export';
import { getCategoryAssignmentColumns } from '../components/category-assignment-columns';
import {
  ALL_CATEGORIES,
  type AssignmentRow,
  type CategoryRow,
} from '../types/types';
import {
  flattenCategoryTree,
  getCategoryExportColumns,
} from '../utils/category-export-columns';
import {
  buildCategoryTree,
  getCategoryPath,
  getChildCount,
  isCategoryInUse,
} from '../utils/category-tree';
import { getCategoryAccess, getCategoryRowActions } from './category-actions';
import { useCategoryFilters } from './filter/use-category-filters';
import type { CategoryDialogState } from './form/use-category-form-dialog';
import { useCategoriesList } from './query/use-categories-list';
import {
  useDeleteCategory,
  useDetachCategoryAttribute,
  useUpdateCategory,
} from './query/use-category-mutations';
import { useCategoryAssignments } from './use-category-assignments';

const NO_CATEGORIES: CategoryRow[] = [];

/** Sum of the root categories' item counts; null when the API sends none. */
function sumRootItemCounts(categories: CategoryRow[]): number | null {
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
}

/** Everything the categories tree page needs; the container only renders it. */
export function useCategoriesPage() {
  const { t } = useTranslation();
  const can = useCan();
  const access = getCategoryAccess(can);
  const filters = useCategoryFilters();
  const { q, category: picked } = filters.search;
  const [dialog, setDialog] = useState<CategoryDialogState>({ kind: 'closed' });
  const closeDialog = useCallback(() => {
    setDialog({ kind: 'closed' });
  }, []);

  // `view` is the tree on screen (narrowed by the search); `full` is the whole
  // tree, which the parent choices, paths and selection read.
  const view = useCategoriesList({ q });
  const full = useCategoriesList({ q: '' });
  const categories = full.data?.content ?? NO_CATEGORIES;
  const nodes = useMemo(
    () => buildCategoryTree(view.data?.content ?? NO_CATEGORIES),
    [view.data],
  );

  // Until the user picks one, the first category of the tree is selected. A
  // picked id that no longer exists (deleted, stale link) falls back too.
  const isAllSelected = picked === ALL_CATEGORIES;
  const pickedExists = categories.some((category) => category.id === picked);
  const selectedId = isAllSelected
    ? null
    : pickedExists
      ? picked
      : (nodes[0]?.id ?? null);
  const selectedCategory =
    categories.find((category) => category.id === selectedId) ?? null;

  const assignments = useCategoryAssignments({
    categoryId: selectedId,
    categories,
  });
  const linkedIds = useMemo(
    () =>
      new Set(
        assignments.rows.flatMap((row) =>
          row.attributeDefinitionId ? [row.attributeDefinitionId] : [],
        ),
      ),
    [assignments.rows],
  );

  const update = useUpdateCategory();
  const removeCategory = useDeleteDialog(
    useDeleteCategory(),
    (category: CategoryRow) => category.name ?? '',
  );
  const detach = useDeleteDialog(
    useDetachCategoryAttribute(selectedId ?? ''),
    (row: AssignmentRow) => row.attributeName ?? '',
  );
  const { openDelete: openDeleteCategory } = removeCategory;
  const { openDelete: openDetach } = detach;
  const { setRequired, setVariantAxis } = assignments;

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
      payload: {
        code: category.code ?? '',
        name: category.name ?? '',
        parentId: category.parentId ?? undefined,
        isActive,
      },
    });
  };

  const getNodeActions = (id: string): RowAction[] => {
    const category = categories.find((item) => item.id === id);
    if (!category) {
      return [];
    }
    return getCategoryRowActions({
      t,
      category,
      canWrite: access.update,
      canDelete: access.delete,
      onEdit: (target) => {
        setDialog({ kind: 'edit', categoryId: target });
      },
      onToggleActive: () => {
        setActive(category, category.isActive === false);
      },
      onMove: (target) => {
        setDialog({ kind: 'move', categoryId: target });
      },
      onDelete: requestDelete,
    });
  };

  const assignmentColumns = useMemo(
    () =>
      getCategoryAssignmentColumns({
        t,
        canWrite: access.update,
        onToggleRequired: setRequired,
        onToggleVariantAxis: setVariantAxis,
        onEditOptions: (row) => {
          if (row.attributeDefinitionId) {
            setDialog({
              kind: 'options',
              attributeId: row.attributeDefinitionId,
            });
          }
        },
        onDetach: openDetach,
      }),
    [t, access.update, setRequired, setVariantAxis, openDetach],
  );

  const exportColumns = useMemo(() => getCategoryExportColumns(t), [t]);
  const exportRows = useMemo(
    () => flattenCategoryTree(nodes, categories),
    [nodes, categories],
  );
  const excel = useExcelExport({
    fileName: 'categories',
    sheetName: t('categories.title'),
    columns: exportColumns,
    load: () => exportRows,
  });

  const blocked =
    dialog.kind === 'blocked'
      ? (categories.find((category) => category.id === dialog.categoryId) ??
        null)
      : null;

  return {
    t,
    tree: {
      query: view,
      nodes,
      search: q,
      setSearch: filters.setQuery,
      isSearching: q !== '',
      selectedId,
      select: filters.select,
      isAllSelected,
      selectAll: filters.selectAll,
      totalItemCount: sumRootItemCounts(categories),
      getNodeActions,
    },
    selected: {
      category: selectedCategory,
      path: selectedId === null ? '' : getCategoryPath(selectedId, categories),
    },
    can: {
      create: access.create,
      update: access.update,
      delete: access.delete,
    },
    assignments: {
      query: assignments.query,
      rows: assignments.rows,
      columns: assignmentColumns,
      canAttach: access.update && selectedId !== null,
    },
    exportExcel: {
      onExport: excel.exportExcel,
      isExporting: excel.isExporting,
      disabled: exportRows.length === 0,
    },
    categories,
    linkedIds,
    dialog,
    closeDialog,
    openCreate: () => {
      setDialog({ kind: 'create', parentId: selectedId ?? '' });
    },
    openEditSelected: () => {
      if (selectedId !== null) {
        setDialog({ kind: 'edit', categoryId: selectedId });
      }
    },
    openMoveSelected: () => {
      if (selectedId !== null) {
        setDialog({ kind: 'move', categoryId: selectedId });
      }
    },
    deleteSelected: () => {
      if (selectedId !== null) {
        requestDelete(selectedId);
      }
    },
    openAttach: () => {
      setDialog({ kind: 'attach' });
    },
    /** After a save: a new category becomes the selection. */
    onCategorySaved: (id: string) => {
      if (dialog.kind === 'create') {
        filters.select(id);
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
        access.update && blocked !== null && blocked.isActive !== false,
      isPending: update.isPending,
      onDeactivate: () => {
        if (blocked === null || update.isPending) {
          return;
        }
        update.mutate(
          {
            id: blocked.id,
            payload: {
              code: blocked.code ?? '',
              name: blocked.name ?? '',
              parentId: blocked.parentId ?? undefined,
              isActive: false,
            },
          },
          { onSuccess: closeDialog },
        );
      },
    },
  };
}

export type CategoriesPage = ReturnType<typeof useCategoriesPage>;
