import { useTranslation } from 'react-i18next';
import { NAV_GROUPS, NAV_HOME } from '../config/nav-config';
import { useVisibleNavGroups } from '../hooks/use-sidebar';
import { SidebarAccordion } from './sidebar-accordion';

interface SidebarNavProps {
  path: string;
  onNavigate?: () => void;
  collapsed?: boolean;
  /** Rail only: expands the sidebar before a group opens. */
  onExpand?: () => void;
}

export function SidebarNav({
  path,
  onNavigate,
  collapsed = false,
  onExpand,
}: SidebarNavProps) {
  const { t } = useTranslation();
  const groups = useVisibleNavGroups(NAV_GROUPS);

  return (
    <nav aria-label={t('shell.nav.label')} className="flex min-h-full flex-col">
      <SidebarAccordion
        home={NAV_HOME}
        groups={groups}
        path={path}
        onNavigate={onNavigate}
        collapsed={collapsed}
        onExpand={onExpand}
      />
    </nav>
  );
}
