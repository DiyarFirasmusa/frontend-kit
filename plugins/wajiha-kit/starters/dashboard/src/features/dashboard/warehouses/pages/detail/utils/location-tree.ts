import type { LocationResponse } from '@/types/api/warehouses';

export interface LocationTreeNode {
  location: LocationResponse;
  children: LocationTreeNode[];
}

const collator = new Intl.Collator(undefined, {
  numeric: true,
  sensitivity: 'base',
});

function byCode(a: LocationResponse, b: LocationResponse): number {
  return collator.compare(a.code ?? '', b.code ?? '');
}

export function buildLocationTree(
  locations: LocationResponse[],
): LocationTreeNode[] {
  const ids = new Set(locations.map((location) => location.id));
  const childrenByParent = new Map<string, LocationResponse[]>();
  const roots: LocationResponse[] = [];

  for (const location of locations) {
    const parentId = location.parentId;
    if (parentId === null || !ids.has(parentId)) {
      roots.push(location);
      continue;
    }
    const siblings = childrenByParent.get(parentId) ?? [];
    siblings.push(location);
    childrenByParent.set(parentId, siblings);
  }

  const visited = new Set<string>();

  const build = (location: LocationResponse): LocationTreeNode => {
    visited.add(location.id);
    const children = (childrenByParent.get(location.id) ?? [])
      .filter((child) => !visited.has(child.id))
      .toSorted(byCode)
      .map((child) => build(child));
    return { location, children };
  };

  const topLevel = roots.toSorted(byCode).map((root) => build(root));

  // Locations that sit in a parentId cycle with no root are never reached
  // from a root. Promote them to roots so every location stays visible.
  for (const location of locations.toSorted(byCode)) {
    if (!visited.has(location.id)) {
      topLevel.push(build(location));
    }
  }

  return topLevel.toSorted((a, b) => byCode(a.location, b.location));
}

/** Every location below `node`, at any depth. */
export function countDescendants(node: LocationTreeNode): number {
  return node.children.reduce(
    (total, child) => total + 1 + countDescendants(child),
    0,
  );
}
