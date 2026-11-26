import type { IconComponent } from '@/components/ui/icons';
import { Building2, Home, Settings } from '@/components/ui/icons';
import { PERMS, type Permission } from '../constants/permissions';

export type AdminNavItem = {
  /** Route path; every admin path starts with /$locale/admin. */
  to: '/$locale/admin' | '/$locale/admin/suppliers' | '/$locale/admin/settings';
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
