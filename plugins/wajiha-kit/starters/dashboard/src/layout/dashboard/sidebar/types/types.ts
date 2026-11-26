import type { Permission } from '@/constants/permissions';
import type { IconComponent } from '@/lib/icons';

export type NavGroupId = string;

/**
 * `TTo` is the path type. Components accept any string; the real config
 * (`config/nav-config.ts`) fixes it to the generated route tree's paths, so a
 * typo in a nav item fails the typecheck.
 */
export interface NavItem<TTo extends string = string> {
  to: TTo;
  labelKey: string;
  icon: IconComponent;
  /** One permission that shows the item. */
  permission?: Permission;
  /** Any one of these permissions shows the item (use instead of `permission`). */
  permissions?: readonly Permission[];
  /** Other route prefixes that belong to this item, so a sub-page still highlights its parent. */
  matches?: readonly TTo[];
}

export interface NavGroup<TTo extends string = string> {
  id: NavGroupId;
  labelKey: string;
  icon: IconComponent;
  to?: TTo;
  permission?: Permission;
  /** Rendered at the bottom of the sidebar, below the other groups. */
  pinned?: boolean;
  items: readonly NavItem<TTo>[];
}
