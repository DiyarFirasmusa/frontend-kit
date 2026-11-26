import type { IconComponent } from '@/components/ui/icons';
import { Building2, Home, Settings } from '@/components/ui/icons';
import type { FileRouteTypes } from '@/routeTree.gen';
import { PERMS, type Permission } from '../constants/permissions';

/**
 * Every admin page that can be a menu entry, taken from the real route list (src/routeTree.gen.ts, which
 * "npm run dev" or "npm run build" regenerates when you add a route file): a new page appears here by
 * itself. The login and no-access pages are routes but never menu entries.
 */
export type AdminPageRoute = Exclude<
  Extract<FileRouteTypes['to'], `/$locale/admin${string}`>,
  '/$locale/admin/login' | '/$locale/admin/forbidden'
>;

export type AdminNavItem = {
  /** Route path; every admin path starts with /$locale/admin. */
  to: AdminPageRoute;
  labelKey: string;
  icon: IconComponent;
  /** Hidden from users without it (the route guard still checks). */
  permission?: Permission;
};

/** The sidebar and the phone menu. Add a line here when you add an admin page. */
export const ADMIN_NAV: readonly AdminNavItem[] = [
  { to: '/$locale/admin', labelKey: 'admin.navOverview', icon: Home },
  {
    to: '/$locale/admin/suppliers',
    labelKey: 'admin.navSuppliers',
    icon: Building2,
    permission: PERMS.supplier.read,
  },
  { to: '/$locale/admin/settings', labelKey: 'admin.navSettings', icon: Settings },
];
