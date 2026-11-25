import type { UseQueryResult } from '@tanstack/react-query';
import { useMemo, useState } from 'react';
import { useTranslation } from 'react-i18next';
import type { SelectOption } from '@/components/fields/select-option';
import type { RowAction } from '@/components/table/data-table-row-actions';
import type { ExportExcelButtonProps } from '@/components/table/export-excel-button';
import { useExcelExport } from '@/hooks/use-excel-export';
import { directionOf } from '@/lib/i18n/languages';
import type {
  AttributeDefinitionResponse,
  ItemCategoryResponse,
} from '@/types/api/catalog';
import type { Column } from '@/types/table';
import { getCategoryAssignmentColumns } from '../components/category-assignment-columns';
import type { AttachAttributeDialogProps } from '../components/dialog/attach-attribute-dialog';
import type { AttributeFormDialogProps } from '../components/dialog/attribute-form-dialog';
import type { AttributeOptionsDialogProps } from '../components/dialog/attribute-options-dialog';
import type { CategoryBlockedDialogProps } from '../components/dialog/category-blocked-dialog';
import type { CategoryFormDialogProps } from '../components/dialog/category-form-dialog';
import type {
  AssignmentRow,
  CategoriesTab,
  CategoryTreeNode,
} from '../types/types';
import {
  flattenCategoryTree,
  getCategoryExportColumns,
} from '../utils/category-export-columns';
import type { AttachAttributeFormValues } from '../validations/validations';
import {
  canDeleteAttribute,
  canReadAttribute,
  canWriteAttribute,
} from './attribute-actions';
import { canDeleteCategory, canWriteCategory } from './category-actions';
import type {
  CategoriesConfirmKind,
  CategoriesConfirmTarget,
} from './confirm-target';
import type { useAttributeFilters } from './filter/use-attribute-filters';
import { useAttachAttributeDialog } from './form/use-attach-attribute-dialog';
import { useDetachCategoryAttribute } from './query/use-category-mutations';
import { useAttributePanel } from './use-attribute-panel';
import type { CategoryAssignmentsView } from './use-category-assignments';
import { useCategoryAssignments } from './use-category-assignments';
import { useCategoryTreeSection } from './use-category-tree-section';

export type { CategoriesConfirmKind } from './confirm-target';

export interface CategoriesConfirmState {
  open: boolean;
  kind: CategoriesConfirmKind;
  name: string;
  isPending: boolean;
  onOpenChange: (open: boolean) => void;
  onConfirm: () => void;
}

export interface CategoriesPage {
  dir: 'rtl' | 'ltr';
  tab: CategoriesTab;
  setTab: (tab: CategoriesTab) => void;
  showAttributesTab: boolean;
  canWriteCategory: boolean;
  canDeleteCategory: boolean;
  canWriteAttribute: boolean;
  canDeleteAttribute: boolean;
  /** Excel export of the category tree (the categories tab). */
  exportExcel: ExportExcelButtonProps;
  onAddCategory: () => void;
  onAddAttribute: () => void;
  categories: {
    query: UseQueryResult<ItemCategoryResponse[]>;
    nodes: CategoryTreeNode[];
    search: string;
    setSearch: (value: string) => void;
    isSearching: boolean;
    selectedId: string | null;
    selectedCategory: ItemCategoryResponse | null;
    selectedPath: string;
    select: (id: string) => void;
    isAllSelected: boolean;
    selectAll: () => void;
    totalItemCount: number | null;
    getNodeActions: (id: string) => RowAction[];
    onEditSelected: () => void;
    onMoveSelected: () => void;
    onDeleteSelected: () => void;
  };
  assignments: CategoryAssignmentsView & {
    columns: Column<AssignmentRow>[];
    onAttachClick: () => void;
  };
  attributes: {
    query: UseQueryResult<AttributeDefinitionResponse[]>;
    rows: AttributeDefinitionResponse[];
    columns: Column<AttributeDefinitionResponse>[];
    filters: ReturnType<typeof useAttributeFilters>;
  };
  categoryDialog: CategoryFormDialogProps;
  blockedDialog: CategoryBlockedDialogProps;
  attachDialog: AttachAttributeDialogProps;
  attributeDialog: AttributeFormDialogProps;
  optionsDialog: AttributeOptionsDialogProps;
  confirm: CategoriesConfirmState;
}

export function useCategoriesPage(initialTab: CategoriesTab): CategoriesPage {
  const { t, i18n } = useTranslation();
  const [tab, setTab] = useState<CategoriesTab>(initialTab);
  const [target, setTarget] = useState<CategoriesConfirmTarget | null>(null);

  const tree = useCategoryTreeSection({ requestDelete: setTarget });
  const panel = useAttributePanel({ requestDelete: setTarget });
  const attachDialog = useAttachAttributeDialog();

  const assignments = useCategoryAssignments({
    categoryId: tree.selectedId,
    categories: tree.categories,
  });
  const detachAssignment = useDetachCategoryAttribute(tree.selectedId ?? '');

  const linkedIds = useMemo(
    () =>
      new Set(
        assignments.rows.flatMap((row) =>
          row.attributeDefinitionId ? [row.attributeDefinitionId] : [],
        ),
      ),
    [assignments.rows],
  );
  const attachOptions = useMemo<SelectOption[]>(
    () =>
      panel.definitions
        .filter(
          (definition) =>
            definition.isActive === true && !linkedIds.has(definition.id),
        )
        .map((definition) => ({
          value: definition.id,
          label: `${definition.name ?? ''} (${definition.code ?? ''})`,
        })),
    [panel.definitions, linkedIds],
  );

  const { setRequired, setVariantAxis } = assignments;
  const { openOptionsFor } = panel;
  const assignmentWrite = tree.canWrite;
  const assignmentColumns = useMemo(
    () =>
      getCategoryAssignmentColumns({
        t,
        canWrite: assignmentWrite,
        onToggleRequired: setRequired,
        onToggleVariantAxis: setVariantAxis,
        onEditOptions: (row) => {
          if (row.attributeDefinitionId) {
            openOptionsFor(row.attributeDefinitionId);
          }
        },
        onDetach: (row) => {
          setTarget({
            kind: 'assignment',
            id: row.id,
            name: row.attributeName ?? '',
          });
        },
      }),
    [t, assignmentWrite, setRequired, setVariantAxis, openOptionsFor],
  );

  const exportColumns = useMemo(() => getCategoryExportColumns(t), [t]);
  const exportRows = useMemo(
    () => flattenCategoryTree(tree.nodes, tree.categories),
    [tree.nodes, tree.categories],
  );
  const excel = useExcelExport({
    fileName: 'categories',
    sheetName: t('categories.title'),
    columns: exportColumns,
    load: () => exportRows,
  });

  const onSubmitAttach = (values: AttachAttributeFormValues) => {
    assignments.attach(
      {
        attributeDefinitionId: values.attributeDefinitionId,
        isRequired: values.isRequired,
        isVariantAxis: values.isVariantAxis,
        sortOrder: assignments.rows.length,
      },
      () => {
        attachDialog.close();
      },
    );
  };

  const clearTarget = () => {
    setTarget(null);
  };

  const onConfirm = () => {
    if (target === null) {
      return;
    }
    if (target.kind === 'category') {
      tree.removeCategory(target.id, clearTarget);
      return;
    }
    if (target.kind === 'assignment') {
      detachAssignment.mutate(target.id, { onSuccess: clearTarget });
      return;
    }
    panel.removeAttribute(target.id, clearTarget);
  };

  return {
    dir: directionOf(i18n.language),
    tab,
    setTab,
    showAttributesTab: canReadAttribute(),
    canWriteCategory: canWriteCategory(),
    canDeleteCategory: canDeleteCategory(),
    canWriteAttribute: canWriteAttribute(),
    canDeleteAttribute: canDeleteAttribute(),
    exportExcel: {
      onExport: excel.exportExcel,
      isExporting: excel.isExporting,
      disabled: exportRows.length === 0,
    },
    onAddCategory: tree.onAddCategory,
    onAddAttribute: panel.onAddAttribute,
    categories: {
      query: tree.query,
      nodes: tree.nodes,
      search: tree.search,
      setSearch: tree.setSearch,
      isSearching: tree.isSearching,
      selectedId: tree.selectedId,
      selectedCategory: tree.selectedCategory,
      selectedPath: tree.selectedPath,
      select: tree.select,
      isAllSelected: tree.isAllSelected,
      selectAll: tree.selectAll,
      totalItemCount: tree.totalItemCount,
      getNodeActions: tree.getNodeActions,
      onEditSelected: tree.onEditSelected,
      onMoveSelected: tree.onMoveSelected,
      onDeleteSelected: tree.onDeleteSelected,
    },
    assignments: {
      ...assignments,
      columns: assignmentColumns,
      onAttachClick: () => {
        if (tree.selectedId !== null) {
          attachDialog.openAttach();
        }
      },
    },
    attributes: {
      query: panel.query,
      rows: panel.rows,
      columns: panel.columns,
      filters: panel.filters,
    },
    categoryDialog: tree.categoryDialog,
    blockedDialog: tree.blockedDialog,
    attachDialog: {
      open: attachDialog.open,
      onOpenChange: attachDialog.onOpenChange,
      attributeOptions: attachOptions,
      isPending: assignments.isAttaching,
      onSubmit: onSubmitAttach,
    },
    attributeDialog: panel.attributeDialog,
    optionsDialog: panel.optionsDialog,
    confirm: {
      open: target !== null,
      kind: target?.kind ?? 'category',
      name: target?.name ?? '',
      isPending:
        tree.isDeletingCategory ||
        detachAssignment.isPending ||
        panel.isDeletingAttribute,
      onOpenChange: (open: boolean) => {
        if (!open) {
          setTarget(null);
        }
      },
      onConfirm,
    },
  };
}
