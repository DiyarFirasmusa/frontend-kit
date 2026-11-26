import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import type { Locale } from '@/shared/lib/i18n/languages';
import { usePermissionStore, isGranted } from '../store/permission-store';
import { ADMIN_NAV } from './nav-config';

const linkClass =
  'gap-inline px-inline text-b1 text-sidebar-foreground hover:bg-sidebar-accent flex min-h-11 items-center rounded-nav font-semibold aria-[current=page]:bg-sidebar-selected aria-[current=page]:text-sidebar-selected-foreground';

/** The admin's page links, shared by the sidebar and the phone menu. */
export function AdminNav({ locale, onNavigate }: { locale: Locale; onNavigate?: () => void }) {
  const { t } = useTranslation();
  const grants = usePermissionStore();
  const items = ADMIN_NAV.filter(
    (item) => item.permission === undefined || isGranted(grants, item.permission),
  );
  return (
    <nav aria-label={t('admin.navLabel')}>
      <ul className="gap-field flex flex-col">
        {items.map((item) => (
          <li key={item.to}>
            <Link
              to={item.to}
              params={{ locale }}
              activeOptions={{ exact: item.to === '/$locale/admin', includeSearch: false }}
              className={linkClass}
              onClick={onNavigate}
            >
              <item.icon className="size-5 shrink-0" aria-hidden="true" />
              {t(item.labelKey)}
            </Link>
          </li>
        ))}
      </ul>
    </nav>
  );
}
