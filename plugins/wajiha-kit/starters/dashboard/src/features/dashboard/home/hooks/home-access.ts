import { PERMS, type Permission } from '@/constants/permissions';
import type { ChangeResource, RecentChange } from '../types/types';

/** The read permission that owns each kind of record the home page shows. */
export const RESOURCE_VIEW_PERMISSION: Record<ChangeResource, Permission> = {
  warehouse: PERMS.warehouse.view,
  supplier: PERMS.supplier.view,
  category: PERMS.itemCategory.view,
  unit: PERMS.unitOfMeasure.view,
};

export type HomeAccess = Record<ChangeResource, boolean>;

/** Which kinds of record this user may read (layer 3 of PERMISSIONS.md). */
export function getHomeAccess(can: (permission: Permission) => boolean) {
  const access: HomeAccess = {
    warehouse: can(RESOURCE_VIEW_PERMISSION.warehouse),
    supplier: can(RESOURCE_VIEW_PERMISSION.supplier),
    category: can(RESOURCE_VIEW_PERMISSION.category),
    unit: can(RESOURCE_VIEW_PERMISSION.unit),
  };
  const flags = Object.values(access);
  return {
    access,
    /** At least one kind is readable: the page has something to show. */
    any: flags.some(Boolean),
    /** The activity chart counts changes of every kind with no split, so it needs all. */
    all: flags.every(Boolean),
  };
}

/** Recent changes of kinds the user may not read are dropped, whatever the backend sent. */
export function filterReadableChanges(
  rows: RecentChange[] | undefined,
  access: HomeAccess,
): RecentChange[] | undefined {
  return rows?.filter((row) => access[row.resource]);
}
