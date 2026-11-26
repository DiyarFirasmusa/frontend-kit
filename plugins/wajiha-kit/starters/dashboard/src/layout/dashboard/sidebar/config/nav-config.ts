import { PERMS } from '@/constants/permissions';
import {
  Building2,
  Cube,
  Hash,
  Home,
  Layers,
  Tag,
  Warehouse,
} from '@/lib/icons';
import type { NavGroup, NavItem } from '../types/types';

// Nav is registered here, never hardcoded in JSX. The sidebar renders
// NAV_GROUPS as an accordion (one open group at a time) and filters by
// permission; NAV_HOME sits above the groups as a standalone link.
export const NAV_HOME: NavItem = {
  to: '/',
  labelKey: 'nav.dashboard',
  icon: Home,
};

export const NAV_GROUPS: readonly NavGroup[] = [
  {
    id: 'products',
    labelKey: 'nav.groups.products',
    icon: Cube,
    items: [
      {
        to: '/categories',
        labelKey: 'nav.categories',
        icon: Tag,
        permission: PERMS.itemCategory.view,
      },
      {
        to: '/attributes',
        labelKey: 'nav.attributes',
        icon: Layers,
        permission: PERMS.attributeDefinition.view,
      },
      {
        to: '/units-of-measure',
        labelKey: 'nav.unitsOfMeasure',
        icon: Hash,
        permission: PERMS.unitOfMeasure.view,
      },
      {
        to: '/suppliers',
        labelKey: 'nav.suppliers',
        icon: Building2,
        permission: PERMS.supplier.view,
      },
    ],
  },
  {
    id: 'warehouses',
    labelKey: 'nav.groups.warehouses',
    icon: Warehouse,
    permission: PERMS.warehouse.view,
    items: [
      {
        to: '/warehouses',
        labelKey: 'nav.warehouses',
        icon: Warehouse,
        permission: PERMS.warehouse.view,
      },
    ],
  },
];

export const NAV_ITEMS: readonly NavItem[] = [
  NAV_HOME,
  ...NAV_GROUPS.flatMap((group) => group.items),
];
