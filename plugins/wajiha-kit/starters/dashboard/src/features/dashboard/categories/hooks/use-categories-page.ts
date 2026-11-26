import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { useCan } from '@/components/auth/can';
import type { RowAction } from '@/components/table/data-table-row-actions';
import { useExcelExport } from '@/hooks/use-excel-export';
import { getCategoryAssignmentColumns } from '../components/category-assignment-columns';
import {
  flattenCategoryTree,
  getCategoryExportColumns,
} from '../utils/category-export-columns';
import { getCategoryPath } from '../utils/category-tree';
import { getCategoryAccess, getCategoryRowActions } from './category-actions';
import { useCategoryFilters } from './filter/use-category-filters';
import { useCategoryAssignments } from './use-category-assignments';
import { useCategoryDialogs } from './use-category-dialogs';
import {
  sumRootItemCounts,
  useCategorySelection,
} from './use-category-selection';

/** Everything the categories tree page needs; the container only renders it. */
export function useCategoriesPage() {
  const { t } = useTranslation();
  const can = useCan();
  const access = getCategoryAccess(can);
  const filters = useCategoryFilters();
  const selection = useCategorySelection(filters);
  const { categories, nodes, selectedId } = selection;

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

  const dialogs = useCategoryDialogs({
    categories,
    selectedId,
    canUpdate: access.update,
    onCreated: filters.select,
  });
  const { openOptions, openDetach } = dialogs;
  const { setRequired, setVariantAxis } = assignments;

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
      onEdit: dialogs.openEdit,
      onToggleActive: () => {
        dialogs.setActive(category, category.isActive === false);
      },
      onMove: dialogs.openMove,
      onDelete: dialogs.requestDelete,
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
            openOptions(row.attributeDefinitionId);
          }
        },
        onDetach: openDetach,
      }),
    [t, access.update, setRequired, setVariantAxis, openOptions, openDetach],
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

  return {
    t,
    tree: {
      query: selection.view,
      nodes,
      search: selection.q,
      setSearch: filters.setQuery,
      isSearching: selection.q !== '',
      selectedId,
      select: filters.select,
      isAllSelected: selection.isAllSelected,
      selectAll: filters.selectAll,
      totalItemCount: sumRootItemCounts(categories),
      getNodeActions,
    },
    selected: {
      category: selection.selectedCategory,
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
    dialog: dialogs.dialog,
    closeDialog: dialogs.closeDialog,
    openCreate: dialogs.openCreate,
    openEditSelected: () => {
      if (selectedId !== null) {
        dialogs.openEdit(selectedId);
      }
    },
    openMoveSelected: () => {
      if (selectedId !== null) {
        dialogs.openMove(selectedId);
      }
    },
    deleteSelected: () => {
      if (selectedId !== null) {
        dialogs.requestDelete(selectedId);
      }
    },
    openAttach: dialogs.openAttach,
    onCategorySaved: dialogs.onCategorySaved,
    deleteCategoryDialog: dialogs.deleteCategoryDialog,
    detachDialog: dialogs.detachDialog,
    blockedDialog: dialogs.blockedDialog,
  };
}

export type CategoriesPage = ReturnType<typeof useCategoriesPage>;
