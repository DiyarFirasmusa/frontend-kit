import type { useTranslation as useTranslationType } from 'react-i18next';
import type { ItemCategoryResponse } from '@/types/api/catalog';
import type { ExportColumn } from '@/types/export';
import { activeBadge } from '@/utils/status-tones';
import type { CategoryTreeNode } from '../types/types';
import { getCategoryPath } from './category-tree';

type TFn = ReturnType<typeof useTranslationType>['t'];

/** One category of the tree, flattened for the Excel export. */
export interface CategoryExportRow {
  category: ItemCategoryResponse;
  /** 1 for a top-level category. */
  level: number;
  /** Path of the parent category; '' for a top-level category. */
  parentPath: string;
}

/** The tree in display order (parent first, then its children), one row per category. */
export function flattenCategoryTree(
  nodes: CategoryTreeNode[],
  categories: ItemCategoryResponse[],
): CategoryExportRow[] {
  const rows: CategoryExportRow[] = [];
  const visit = (node: CategoryTreeNode) => {
    const parentId = node.category.parentId;
    rows.push({
      category: node.category,
      level: node.depth + 1,
      parentPath: parentId ? getCategoryPath(parentId, categories) : '',
    });
    node.children.forEach((item) => {
      visit(item);
    });
  };
  nodes.forEach((item) => {
    visit(item);
  });
  return rows;
}

/** Excel columns of the category tree, with the on-screen labels. */
export function getCategoryExportColumns(
  t: TFn,
): ExportColumn<CategoryExportRow>[] {
  return [
    { header: t('categories.form.code'), value: (row) => row.category.code },
    { header: t('categories.form.name'), value: (row) => row.category.name },
    {
      header: t('categories.form.parent'),
      value: (row) => row.parentPath || null,
    },
    { header: t('categories.export.level'), value: (row) => row.level },
    {
      header: t('categories.export.itemCount'),
      value: (row) => row.category.itemCount,
    },
    {
      header: t('categories.export.childCount'),
      value: (row) => row.category.childCount,
    },
    {
      header: t('categories.form.expiryAlertDays'),
      value: (row) => row.category.expiryAlertDays ?? null,
    },
    {
      header: t('common.status'),
      value: (row) =>
        row.category.isActive === null
          ? null
          : t(activeBadge(row.category.isActive).labelKey),
    },
  ];
}
