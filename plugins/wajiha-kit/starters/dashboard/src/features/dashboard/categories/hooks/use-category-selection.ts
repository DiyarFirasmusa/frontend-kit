import { useMemo } from 'react';
import { ALL_CATEGORIES, type CategoryRow } from '../types/types';
import { buildCategoryTree } from '../utils/category-tree';
import type { useCategoryFilters } from './filter/use-category-filters';
import { useCategoriesList } from './query/use-categories-list';

const NO_CATEGORIES: CategoryRow[] = [];

/** Sum of the root categories' item counts; null when the API sends none. */
export function sumRootItemCounts(categories: CategoryRow[]): number | null {
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

/**
 * The tree and which category is selected. `view` is the tree on screen
 * (narrowed by the search); `categories` is the whole tree, which the parent
 * choices, paths and selection read.
 */
export function useCategorySelection(
  filters: ReturnType<typeof useCategoryFilters>,
) {
  const { q, category: picked } = filters.search;
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

  return {
    q,
    view,
    categories,
    nodes,
    isAllSelected,
    selectedId,
    selectedCategory,
  };
}
