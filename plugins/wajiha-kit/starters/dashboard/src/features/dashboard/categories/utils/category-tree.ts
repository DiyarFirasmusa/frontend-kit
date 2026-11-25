import type { ItemCategoryResponse } from '@/types/api/catalog';
import type { CategoryTreeNode } from '../types/types';

const EMPTY_VALUE = '—';

function compareByName(
  a: ItemCategoryResponse,
  b: ItemCategoryResponse,
): number {
  return (a.name ?? '').localeCompare(b.name ?? '');
}

function buildChildrenMap(
  categories: ItemCategoryResponse[],
): Map<string, ItemCategoryResponse[]> {
  const byId = new Set(categories.map((category) => category.id));
  const childrenMap = new Map<string, ItemCategoryResponse[]>();
  for (const category of categories) {
    const parentId = category.parentId;
    if (parentId === null || parentId === undefined || !byId.has(parentId)) {
      continue;
    }
    const siblings = childrenMap.get(parentId) ?? [];
    siblings.push(category);
    childrenMap.set(parentId, siblings);
  }
  for (const [parentId, siblings] of childrenMap) {
    childrenMap.set(parentId, siblings.toSorted(compareByName));
  }
  return childrenMap;
}

function buildNode(
  category: ItemCategoryResponse,
  depth: number,
  childrenMap: Map<string, ItemCategoryResponse[]>,
  visited: Set<string>,
): CategoryTreeNode | null {
  if (visited.has(category.id)) {
    return null;
  }
  visited.add(category.id);
  const children: CategoryTreeNode[] = [];
  for (const child of childrenMap.get(category.id) ?? []) {
    const node = buildNode(child, depth + 1, childrenMap, visited);
    if (node) {
      children.push(node);
    }
  }
  return { id: category.id, category, depth, children };
}

/**
 * Builds the category hierarchy. Roots are categories without a parent or
 * whose parent is missing from the list (orphans). Siblings are sorted by name.
 * Categories that sit on a cycle with no root are attached as extra roots
 * so they stay visible; nodes already visited are not added twice.
 */
export function buildCategoryTree(
  categories: ItemCategoryResponse[],
): CategoryTreeNode[] {
  const byId = new Set(categories.map((category) => category.id));
  const childrenMap = buildChildrenMap(categories);
  const roots = categories
    .filter(
      (category) =>
        category.parentId === null ||
        category.parentId === undefined ||
        !byId.has(category.parentId),
    )
    .toSorted(compareByName);
  const visited = new Set<string>();
  const nodes: CategoryTreeNode[] = [];
  for (const root of roots) {
    const node = buildNode(root, 0, childrenMap, visited);
    if (node) {
      nodes.push(node);
    }
  }
  for (const category of categories) {
    if (!visited.has(category.id)) {
      const node = buildNode(category, 0, childrenMap, visited);
      if (node) {
        nodes.push(node);
      }
    }
  }
  return nodes;
}

function matchesQuery(category: ItemCategoryResponse, query: string): boolean {
  const name = (category.name ?? '').toLowerCase();
  const code = (category.code ?? '').toLowerCase();
  return name.includes(query) || code.includes(query);
}

function filterNode(
  node: CategoryTreeNode,
  query: string,
): CategoryTreeNode | null {
  if (matchesQuery(node.category, query)) {
    return node;
  }
  const children = node.children
    .map((child) => filterNode(child, query))
    .filter((child): child is CategoryTreeNode => child !== null);
  if (children.length === 0) {
    return null;
  }
  return { ...node, children };
}

/**
 * Keeps nodes that match the query (name or code, case-insensitive) together
 * with their ancestors. A matching node keeps its whole subtree so its children
 * stay reachable. An empty query returns the input unchanged.
 */
export function filterCategoryTree(
  nodes: CategoryTreeNode[],
  query: string,
): CategoryTreeNode[] {
  const normalized = query.trim().toLowerCase();
  if (normalized === '') {
    return nodes;
  }
  return nodes
    .map((node) => filterNode(node, normalized))
    .filter((node): node is CategoryTreeNode => node !== null);
}

/** Names from the root down to the node, joined with ' / '. '' when not found. */
export function getCategoryPath(
  categoryId: string,
  categories: ItemCategoryResponse[],
): string {
  const byId = new Map(categories.map((category) => [category.id, category]));
  const names: string[] = [];
  const visited = new Set<string>();
  let current = byId.get(categoryId);
  while (current && !visited.has(current.id)) {
    visited.add(current.id);
    names.unshift(current.name ?? '');
    current = current.parentId ? byId.get(current.parentId) : undefined;
  }
  if (!byId.has(categoryId)) {
    return '';
  }
  return names.join(' / ');
}

/** All descendants of the node, excluding the node itself. */
export function getDescendantIds(
  categoryId: string,
  categories: ItemCategoryResponse[],
): Set<string> {
  const childrenMap = buildChildrenMap(categories);
  const descendants = new Set<string>();
  const queue = [...(childrenMap.get(categoryId) ?? [])];
  while (queue.length > 0) {
    const next = queue.shift();
    if (!next || descendants.has(next.id) || next.id === categoryId) {
      continue;
    }
    descendants.add(next.id);
    queue.push(...(childrenMap.get(next.id) ?? []));
  }
  return descendants;
}

/** Category name, or '—' when the id is null or unknown. */
export function getCategoryName(
  categoryId: string | null,
  categories: ItemCategoryResponse[],
): string {
  if (categoryId === null) {
    return EMPTY_VALUE;
  }
  const category = categories.find((item) => item.id === categoryId);
  return category?.name?.trim() || EMPTY_VALUE;
}

/** Direct children: `childCount` from the API, else counted from the list. */
export function getChildCount(
  category: ItemCategoryResponse,
  categories: ItemCategoryResponse[],
): number {
  if (typeof category.childCount === 'number') {
    return category.childCount;
  }
  return categories.filter((item) => item.parentId === category.id).length;
}

/** True when the backend reports linked items or the category has children. */
export function isCategoryInUse(
  category: ItemCategoryResponse,
  categories: ItemCategoryResponse[],
): boolean {
  return (
    (category.itemCount ?? 0) > 0 || getChildCount(category, categories) > 0
  );
}
