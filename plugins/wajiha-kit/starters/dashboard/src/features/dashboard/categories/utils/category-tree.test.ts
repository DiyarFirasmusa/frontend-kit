import { describe, expect, it } from 'vitest';
import type { ItemCategoryResponse } from '@/types/api/catalog';
import type { CategoryTreeNode } from '../types/types';
import {
  buildCategoryTree,
  filterCategoryTree,
  getCategoryName,
  getCategoryPath,
  getDescendantIds,
} from './category-tree';

function cat(
  id: string,
  name: string | null,
  parentId: string | null = null,
  code: string | null = null,
): ItemCategoryResponse {
  return {
    id,
    name,
    parentId,
    code,
    isActive: true,
    itemCount: null,
    childCount: null,
  };
}

const safety = cat('cat-safety', 'Safety', null, 'SAFETY');
const hand = cat('cat-hand', 'Hand protection', 'cat-safety', 'SAF-HAND');
const gloves = cat('cat-gloves', 'Gloves', 'cat-hand');
const storage = cat('cat-storage', 'Storage', null, 'STORAGE');

function names(nodes: CategoryTreeNode[]): string[] {
  return nodes.map((node) => node.category.name ?? '');
}

describe('buildCategoryTree', () => {
  it('builds roots with depth 0 and nested children', () => {
    const tree = buildCategoryTree([gloves, safety, hand]);
    expect(names(tree)).toEqual(['Safety']);
    expect(tree[0]?.depth).toBe(0);
    expect(tree[0]?.children[0]?.depth).toBe(1);
    expect(tree[0]?.children[0]?.children[0]?.category.id).toBe('cat-gloves');
  });

  it('turns an orphan whose parent is missing into a root', () => {
    const orphan = cat('cat-orphan', 'Orphan', 'missing-parent');
    const tree = buildCategoryTree([orphan, safety]);
    expect(names(tree)).toEqual(['Orphan', 'Safety']);
  });

  it('sorts siblings by name', () => {
    const tree = buildCategoryTree([
      cat('p', 'Parent'),
      cat('c-z', 'Zinc', 'p'),
      cat('c-a', 'Alpha', 'p'),
      cat('c-n', null, 'p'),
    ]);
    expect(names(tree[0]?.children ?? [])).toEqual(['', 'Alpha', 'Zinc']);
  });

  it('does not hang on cycles and keeps cycle members visible once', () => {
    const a = cat('a', 'A', 'b');
    const b = cat('b', 'B', 'a');
    const root = cat('root', 'Root');
    const tree = buildCategoryTree([a, b, root]);
    expect(names(tree)).toEqual(['Root', 'A']);
    expect(names(tree[1]?.children ?? [])).toEqual(['B']);
    expect(tree[1]?.children[0]?.children).toEqual([]);
  });

  it('keeps a self-parented category as a single root', () => {
    const self = cat('s', 'Self', 's');
    const tree = buildCategoryTree([self]);
    expect(names(tree)).toEqual(['Self']);
    expect(tree[0]?.children).toEqual([]);
  });

  it('returns an empty tree for an empty list', () => {
    expect(buildCategoryTree([])).toEqual([]);
  });
});

describe('filterCategoryTree', () => {
  const tree = buildCategoryTree([safety, hand, gloves, storage]);

  it('returns the input unchanged for an empty or blank query', () => {
    expect(filterCategoryTree(tree, '')).toBe(tree);
    expect(filterCategoryTree(tree, '   ')).toBe(tree);
  });

  it('keeps ancestors of a matching descendant', () => {
    const result = filterCategoryTree(tree, 'gloves');
    expect(names(result)).toEqual(['Safety']);
    expect(names(result[0]?.children ?? [])).toEqual(['Hand protection']);
    expect(names(result[0]?.children[0]?.children ?? [])).toEqual(['Gloves']);
  });

  it('keeps the whole subtree of a matching node', () => {
    const result = filterCategoryTree(tree, 'safety');
    expect(names(result)).toEqual(['Safety']);
    expect(names(result[0]?.children ?? [])).toEqual(['Hand protection']);
    expect(names(result[0]?.children[0]?.children ?? [])).toEqual(['Gloves']);
  });

  it('matches case-insensitively on code', () => {
    const result = filterCategoryTree(tree, ' storage ');
    expect(names(result)).toEqual(['Storage']);
    const byCode = filterCategoryTree(tree, 'saf-hand');
    expect(names(byCode)).toEqual(['Safety']);
  });

  it('returns an empty list when nothing matches', () => {
    expect(filterCategoryTree(tree, 'zzz')).toEqual([]);
  });
});

describe('getCategoryPath', () => {
  const categories = [safety, hand, gloves];

  it('joins names from root to node with " / "', () => {
    expect(getCategoryPath('cat-hand', categories)).toBe(
      'Safety / Hand protection',
    );
    expect(getCategoryPath('cat-gloves', categories)).toBe(
      'Safety / Hand protection / Gloves',
    );
  });

  it('returns a root name alone and "" for an unknown id', () => {
    expect(getCategoryPath('cat-safety', categories)).toBe('Safety');
    expect(getCategoryPath('nope', categories)).toBe('');
  });

  it('stops on a cycle instead of looping', () => {
    const a = cat('a', 'A', 'b');
    const b = cat('b', 'B', 'a');
    expect(getCategoryPath('a', [a, b])).toBe('B / A');
  });
});

describe('getDescendantIds', () => {
  const categories = [safety, hand, gloves, storage];

  it('returns all descendants excluding the node itself', () => {
    expect([...getDescendantIds('cat-safety', categories)].toSorted()).toEqual([
      'cat-gloves',
      'cat-hand',
    ]);
    expect(getDescendantIds('cat-gloves', categories).size).toBe(0);
  });

  it('does not include the node itself on a cycle', () => {
    const a = cat('a', 'A', 'b');
    const b = cat('b', 'B', 'a');
    expect([...getDescendantIds('a', [a, b])]).toEqual(['b']);
  });
});

describe('getCategoryName', () => {
  const categories = [safety, cat('x', null)];

  it('returns the em dash for an empty or blank name', () => {
    const blank = [cat('e', ''), cat('w', '   ')];
    expect(getCategoryName('e', blank)).toBe('—');
    expect(getCategoryName('w', blank)).toBe('—');
  });

  it('returns the name, or the em dash when null, missing or unknown', () => {
    expect(getCategoryName('cat-safety', categories)).toBe('Safety');
    expect(getCategoryName('x', categories)).toBe('—');
    expect(getCategoryName('unknown', categories)).toBe('—');
    expect(getCategoryName(null, categories)).toBe('—');
  });
});
