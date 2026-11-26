import { useRef, useState, type ReactElement } from 'react';
import { useTranslation } from 'react-i18next';
import { MobileSidebar } from '../../sidebar/components/mobile-sidebar';
import { INLINE_SEARCH_QUERY } from '../hooks/use-media-query';
import { useSearchShortcut } from '../hooks/use-search-shortcut';
import { useTopbar } from '../hooks/use-topbar';
import { AccountMenu } from './account-menu';
import { GlobalSearch } from './global-search';
import { LanguageMenu } from './language-menu';
import { NotificationsMenu } from './notifications-menu';
import { SearchDialog } from './search-dialog';
import { ThemeToggle } from './theme-toggle';

/**
 * One bar at every width. Phones (below md): menu, title, search button,
 * notifications and the account menu, which also holds theme and language.
 * From md: the desktop bar; the search field itself shows from 1100px
 * (INLINE_SEARCH_QUERY), a search button below that.
 */
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
  const inlineSearchRef = useRef<HTMLInputElement>(null);
  const [searchOpen, setSearchOpen] = useState(false);

  useSearchShortcut(() => {
    const input = inlineSearchRef.current;
    if (input && window.matchMedia(INLINE_SEARCH_QUERY).matches) {
      input.focus();
      input.select();
      return;
    }
    setSearchOpen(true);
  });

  return (
    <header
      data-slot="topbar"
      className="topbar gap-inline sticky top-0 z-30 flex w-full shrink-0 items-center px-4 md:gap-6 md:px-6"
    >
      <MobileSidebar className="md:hidden" />
      <GlobalSearch
        inputRef={inlineSearchRef}
        className="hidden max-w-[440px] min-w-32 min-[1100px]:block"
      />
      <div className="gap-field md:gap-inline ms-auto flex min-w-0 shrink-0 items-center">
        <SearchDialog
          open={searchOpen}
          onOpenChange={setSearchOpen}
          className="min-[1100px]:hidden"
        />
        <div className="gap-inline hidden items-center md:flex">
          <ThemeToggle theme={theme} onChange={setTheme} />
          <LanguageMenu language={language} onChange={setLanguage} />
        </div>
        <NotificationsMenu />
        <AccountMenu
          displayName={displayName}
          roleLabel={roleLabel}
          orgUnitName={orgUnitName}
          avatarUrl={avatarUrl}
          initials={initials}
          onLogout={logout}
          theme={theme}
          onThemeChange={setTheme}
          language={language}
          onLanguageChange={setLanguage}
        />
      </div>
    </header>
  );
}
