import { describe, expect, it } from 'vitest';
import type { ItemCategoryResponse } from '@/types/api/catalog';
import { getChildCount, isCategoryInUse } from './category-tree';

function category(
  id: string,
  overrides: Partial<ItemCategoryResponse> = {},
): ItemCategoryResponse {
  return {
    id,
    parentId: null,
    code: id.toUpperCase(),
    name: id,
    isActive: true,
    itemCount: null,
    childCount: null,
    ...overrides,
  };
}

describe('getChildCount', () => {
  it('uses childCount from the API when present', () => {
    const parent = category('safety', { childCount: 4 });
    expect(getChildCount(parent, [parent])).toBe(4);
  });

  it('counts direct children from the list when childCount is null', () => {
    const parent = category('safety');
    const list = [
      parent,
      category('hand', { parentId: 'safety' }),
      category('gloves', { parentId: 'hand' }),
    ];
    expect(getChildCount(parent, list)).toBe(1);
  });
});

describe('isCategoryInUse', () => {
  it('is true when the category has items', () => {
    const leaf = category('hand', { itemCount: 62, childCount: 0 });
    expect(isCategoryInUse(leaf, [leaf])).toBe(true);
  });

  it('is true when the category has children', () => {
    const parent = category('safety', { itemCount: 0, childCount: 2 });
    expect(isCategoryInUse(parent, [parent])).toBe(true);
  });

  it('is false for an empty leaf or when the counts are unknown', () => {
    const empty = category('services', { itemCount: 0, childCount: 0 });
    const unknown = category('misc');
    expect(isCategoryInUse(empty, [empty])).toBe(false);
    expect(isCategoryInUse(unknown, [unknown])).toBe(false);
  });
});
