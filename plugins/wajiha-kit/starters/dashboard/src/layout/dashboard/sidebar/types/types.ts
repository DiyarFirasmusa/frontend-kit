import type { Permission } from '@/constants/permissions';
import type { IconComponent } from '@/lib/icons';

export type NavGroupId = string;

export interface NavItem {
  to: string;
  labelKey: string;
  icon: IconComponent;
  /** One permission that shows the item. */
  permission?: Permission;
  /** Any one of these permissions shows the item (use instead of `permission`). */
  permissions?: readonly Permission[];
  /** Other route prefixes that belong to this item, so a sub-page still highlights its parent. */
  matches?: readonly string[];
}

export interface NavGroup {
  id: NavGroupId;
  labelKey: string;
  icon: IconComponent;
  to?: string;
  permission?: Permission;
  /** Rendered at the bottom of the sidebar, below the other groups. */
  pinned?: boolean;
  items: readonly NavItem[];
}
