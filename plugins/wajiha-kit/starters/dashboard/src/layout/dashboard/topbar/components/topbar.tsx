import type { ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { useTopbar } from '../hooks/use-topbar';
import { AccountMenu } from './account-menu';
import { GlobalSearch } from './global-search';
import { LanguageMenu } from './language-menu';
import { NotificationsMenu } from './notifications-menu';
import { ThemeToggle } from './theme-toggle';

export function DashboardTopbar(): ReactElement {
  const { t } = useTranslation();
  const {
    theme,
    setTheme,
    language,
    setLanguage,
    displayName,
    jobTitle,
    orgUnitName,
    avatarUrl,
    firstRole,
    initials,
    logout,
  } = useTopbar();
  const roleLabel =
    jobTitle ??
    (firstRole === '—'
      ? firstRole
      : t(`shell.roles.${firstRole}`, { defaultValue: firstRole }));

  return (
    <header
      data-slot="topbar"
      className="topbar sticky top-[72px] z-30 flex w-full shrink-0 items-center justify-between gap-6 px-4 md:top-0 md:px-6"
    >
      <GlobalSearch className="hidden max-w-[440px] min-w-32 min-[1100px]:block" />
      <div className="gap-inline flex min-w-0 items-center md:ms-auto">
        <ThemeToggle theme={theme} onChange={setTheme} />
        <LanguageMenu language={language} onChange={setLanguage} />
        <NotificationsMenu />
        <AccountMenu
          displayName={displayName}
          roleLabel={roleLabel}
          orgUnitName={orgUnitName}
          avatarUrl={avatarUrl}
          initials={initials}
          onLogout={logout}
        />
      </div>
    </header>
  );
}
