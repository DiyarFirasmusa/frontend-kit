import { useState } from 'react';
import type { NavGroup, NavItem } from '../types/types';
import { itemMatchLength } from './use-sidebar';

function segments(path: string): string[] {
  return path.split('/').filter(Boolean);
}

function sharedSegments(a: string, b: string): number {
  const left = segments(a);
  const right = segments(b);
  let count = 0;
  while (count < left.length && left[count] === right[count]) {
    count += 1;
  }
  return count;
}

/**
 * Returns the id of the group that owns the route, or null when no group
 * matches. A group matches through one of its items (their `to` or extra
 * `matches` prefixes) or through its own link (`group.to`); the longest
 * matching path wins. A route no item lists, such as a new `/stock/…` page,
 * falls back to the group whose links share the most leading path segments
 * with it, so its group still opens.
 */
export function findActiveGroupId(
  groups: readonly NavGroup[],
  path: string,
): string | null {
  let bestId: string | null = null;
  let bestLength = -1;
  for (const group of groups) {
    const groupLength = group.to ? itemMatchLength({ to: group.to }, path) : -1;
    if (groupLength > bestLength) {
      bestId = group.id;
      bestLength = groupLength;
    }
    for (const item of group.items) {
      const length = itemMatchLength(item, path);
      if (length > bestLength) {
        bestId = group.id;
        bestLength = length;
      }
    }
  }
  return bestId ?? findNearestGroupId(groups, path);
}

function findNearestGroupId(
  groups: readonly NavGroup[],
  path: string,
): string | null {
  let bestId: string | null = null;
  let bestShared = 0;
  for (const group of groups) {
    const links = [
      ...(group.to ? [group.to] : []),
      ...group.items.map((item) => item.to),
    ];
    for (const link of links) {
      const shared = sharedSegments(link, path);
      if (shared > bestShared) {
        bestId = group.id;
        bestShared = shared;
      }
    }
  }
  return bestId;
}

/** The item of a group that owns the route (longest match), or null. */
export function findActiveItemTo(
  items: readonly NavItem[],
  path: string,
): string | null {
  let bestTo: string | null = null;
  let bestLength = -1;
  for (const item of items) {
    const length = itemMatchLength(item, path);
    if (length > bestLength) {
      bestTo = item.to;
      bestLength = length;
    }
  }
  return bestTo;
}

export function useSidebarAccordion(groups: readonly NavGroup[], path: string) {
  const activeGroupId = findActiveGroupId(groups, path);
  const [openGroupId, setOpenGroupId] = useState<string | null>(activeGroupId);
  const [prevActiveGroupId, setPrevActiveGroupId] = useState(activeGroupId);

  if (activeGroupId !== prevActiveGroupId) {
    setPrevActiveGroupId(activeGroupId);
    if (activeGroupId) {
      setOpenGroupId(activeGroupId);
    }
  }

  const toggleGroup = (id: string) => {
    setOpenGroupId((prev) => (prev === id ? null : id));
  };

  const openGroup = (id: string) => {
    setOpenGroupId(id);
  };

  return {
    openGroupId,
    isGroupOpen: (id: string) => openGroupId === id,
    toggleGroup,
    openGroup,
  };
}
