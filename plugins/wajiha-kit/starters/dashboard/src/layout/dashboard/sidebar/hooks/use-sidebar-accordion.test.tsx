import { act, renderHook } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { BarChart } from '@/lib/icons';
import type { NavGroup } from '../types/types';
import {
  findActiveGroupId,
  findActiveItemTo,
  useSidebarAccordion,
} from './use-sidebar-accordion';

const GROUPS: NavGroup[] = [
  {
    id: 'operations',
    labelKey: 'nav.groups.operations',
    icon: BarChart,
    items: [{ to: '/approvals', labelKey: 'nav.approvals', icon: BarChart }],
  },
  {
    id: 'stock',
    labelKey: 'nav.groups.stock',
    icon: BarChart,
    items: [
      { to: '/stock/on-hand', labelKey: 'nav.stockOnHand', icon: BarChart },
      { to: '/stock', labelKey: 'nav.stock', icon: BarChart },
    ],
  },
];

describe('findActiveGroupId', () => {
  it('returns the group containing the route', () => {
    expect(findActiveGroupId(GROUPS, '/approvals')).toBe('operations');
    expect(findActiveGroupId(GROUPS, '/stock/on-hand/x')).toBe('stock');
  });

  it('prefers the longest matching item path', () => {
    const groups: NavGroup[] = [
      {
        id: 'operations',
        labelKey: 'x',
        icon: BarChart,
        items: [{ to: '/a', labelKey: 'x', icon: BarChart }],
      },
      {
        id: 'stock',
        labelKey: 'x',
        icon: BarChart,
        items: [{ to: '/a/b', labelKey: 'x', icon: BarChart }],
      },
    ];
    expect(findActiveGroupId(groups, '/a/b/c')).toBe('stock');
  });

  it('returns null when no group matches', () => {
    expect(findActiveGroupId(GROUPS, '/nowhere')).toBeNull();
    expect(findActiveGroupId(GROUPS, '/')).toBeNull();
  });

  it('matches an item through its extra prefixes', () => {
    const groups: NavGroup[] = [
      {
        id: 'stock',
        labelKey: 'x',
        icon: BarChart,
        items: [
          {
            to: '/stock/valuation',
            labelKey: 'x',
            icon: BarChart,
            matches: ['/stock/landed-costs'],
          },
        ],
      },
    ];
    expect(findActiveGroupId(groups, '/stock/landed-costs/lc-1')).toBe('stock');
    expect(
      findActiveItemTo(groups[0]?.items ?? [], '/stock/landed-costs'),
    ).toBe('/stock/valuation');
  });

  it('falls back to the group sharing the most leading segments', () => {
    const groups: NavGroup[] = [
      ...GROUPS,
      {
        id: 'products',
        labelKey: 'x',
        icon: BarChart,
        items: [{ to: '/stock-x', labelKey: 'x', icon: BarChart }],
      },
    ];
    expect(findActiveGroupId(groups, '/stock/cost-layers')).toBe('stock');
    expect(findActiveItemTo(GROUPS[0]?.items ?? [], '/stock/x')).toBeNull();
  });

  it('opens a group that owns its own link when the route is that link', () => {
    const groups: NavGroup[] = [
      ...GROUPS,
      {
        id: 'warehouses',
        labelKey: 'nav.groups.warehouses',
        icon: BarChart,
        to: '/warehouses',
        items: [
          { to: '/locations', labelKey: 'nav.locations', icon: BarChart },
        ],
      },
    ];
    expect(findActiveGroupId(groups, '/warehouses')).toBe('warehouses');
    expect(findActiveGroupId(groups, '/locations')).toBe('warehouses');
  });
});

describe('useSidebarAccordion', () => {
  it('opens the group containing the initial route', () => {
    const { result } = renderHook(() =>
      useSidebarAccordion(GROUPS, '/stock/on-hand'),
    );
    expect(result.current.openGroupId).toBe('stock');
    expect(result.current.isGroupOpen('stock')).toBe(true);
    expect(result.current.isGroupOpen('operations')).toBe(false);
  });

  it('keeps only one group open and collapses on a second click', () => {
    const { result } = renderHook(() =>
      useSidebarAccordion(GROUPS, '/approvals'),
    );
    act(() => {
      result.current.toggleGroup('stock');
    });
    expect(result.current.openGroupId).toBe('stock');
    act(() => {
      result.current.toggleGroup('stock');
    });
    expect(result.current.openGroupId).toBeNull();
  });

  it('follows the route when it moves to another group', () => {
    const { result, rerender } = renderHook(
      ({ path }: { path: string }) => useSidebarAccordion(GROUPS, path),
      { initialProps: { path: '/approvals' } },
    );
    rerender({ path: '/stock/on-hand' });
    expect(result.current.openGroupId).toBe('stock');
  });
});
