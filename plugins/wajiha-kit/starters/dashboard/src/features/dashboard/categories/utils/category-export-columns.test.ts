import { beforeAll, describe, expect, it } from 'vitest';
import i18n, { loadFeatureLocale } from '@/lib/i18n/i18n';
import { tt } from '@/test/i18n';
import type { ItemCategoryResponse } from '@/types/api/catalog';
import { toExportMatrix } from '@/utils/export-table';
import {
  flattenCategoryTree,
  getCategoryExportColumns,
} from './category-export-columns';
import { buildCategoryTree } from './category-tree';

function category(
  overrides: Partial<ItemCategoryResponse> & { id: string },
): ItemCategoryResponse {
  return {
    parentId: null,
    code: overrides.id.toUpperCase(),
    name: overrides.id,
    isActive: true,
    itemCount: 0,
    childCount: 0,
    expiryAlertDays: null,
    ...overrides,
  };
}

const categories = [
  category({ id: 'gloves', name: 'Gloves', parentId: 'ppe', itemCount: 4 }),
  category({ id: 'ppe', name: 'PPE', childCount: 1, expiryAlertDays: 30 }),
  category({ id: 'tools', name: 'Tools', isActive: false }),
];

beforeAll(async () => {
  await loadFeatureLocale('dashboard/categories');
});

describe('flattenCategoryTree', () => {
  it('lists parents before their children with the level and parent path', () => {
    const rows = flattenCategoryTree(buildCategoryTree(categories), categories);

    expect(
      rows.map((row) => [row.category.id, row.level, row.parentPath]),
    ).toEqual([
      ['ppe', 1, ''],
      ['gloves', 2, 'PPE'],
      ['tools', 1, ''],
    ]);
  });
});

describe('getCategoryExportColumns', () => {
  it('uses the on-screen headers and plain cell values', () => {
    const columns = getCategoryExportColumns(i18n.t);
    const rows = flattenCategoryTree(buildCategoryTree(categories), categories);

    expect(columns.map((column) => column.header)).toEqual([
      tt('categories.form.code'),
      tt('categories.form.name'),
      tt('categories.form.parent'),
      tt('categories.export.level'),
      tt('categories.export.itemCount'),
      tt('categories.export.childCount'),
      tt('categories.form.expiryAlertDays'),
      tt('common.status'),
    ]);
    const matrix = toExportMatrix(rows, columns);
    expect(matrix[0]).toEqual([
      'PPE',
      'PPE',
      null,
      1,
      0,
      1,
      30,
      tt('common.active'),
    ]);
    expect(matrix[1]?.slice(0, 5)).toEqual(['GLOVES', 'Gloves', 'PPE', 2, 4]);
    expect(matrix[2]?.at(-1)).toBe(tt('common.inactive'));
  });
});
