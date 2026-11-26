import { Link, Outlet } from '@tanstack/react-router';
import { useState } from 'react';
import { useTranslation } from 'react-i18next';
import { LanguageSwitcher } from '@/components/common/language-switcher';
import { RouteAnnouncer } from '@/components/common/route-announcer';
import { ThemeToggle } from '@/components/common/theme-toggle';
import { Button } from '@/components/ui/button';
import { Menu } from '@/components/ui/icons';
import { Sheet, SheetContent, SheetTitle } from '@/components/ui/sheet';
import { siteName } from '@/config/site.config';
import type { Locale } from '@/shared/lib/i18n/languages';
import { AdminNav } from './admin-nav';
import { UserMenu } from './user-menu';

function Brand({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  return (
    <Link
      to="/$locale/admin"
      params={{ locale }}
      className="gap-field text-text-primary flex min-h-11 items-center font-bold"
    >
      <img src="/favicon.svg" alt="" width="28" height="28" className="size-7" />
      <span className="flex flex-col leading-tight">
        <span className="text-h5">{siteName(locale)}</span>
        <span className="text-b3 text-text-muted">{t('admin.title')}</span>
      </span>
    </Link>
  );
}

/** The signed-in frame: sidebar on wide screens, a menu sheet on phones, the top bar, the page. */
export function AdminShell({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <div className="bg-background min-h-dvh lg:flex">
      <a
        href="#admin-main"
        className="bg-primary text-primary-foreground absolute start-2 -top-16 z-50 rounded-md px-4 py-2 font-semibold focus:top-2"
      >
        {t('common.skipToContent')}
      </a>

      <aside className="border-sidebar-border bg-sidebar p-row gap-card sticky top-0 hidden h-dvh w-64 shrink-0 flex-col border-e lg:flex">
        <Brand locale={locale} />
        <AdminNav locale={locale} />
      </aside>

      <Sheet open={menuOpen} onOpenChange={setMenuOpen}>
        <SheetContent side="inline-start" className="p-row gap-card w-72">
          <SheetTitle className="sr-only">{t('admin.menu')}</SheetTitle>
          <Brand locale={locale} />
          <AdminNav
            locale={locale}
            onNavigate={() => {
              setMenuOpen(false);
            }}
          />
        </SheetContent>
      </Sheet>

      <div className="flex min-w-0 flex-1 flex-col">
        <header className="border-stroke bg-surface px-row gap-field sticky top-0 z-30 flex min-h-16 items-center border-b">
          <Button
            variant="ghost"
            size="icon"
            className="lg:hidden"
            aria-label={t('admin.openMenu')}
            aria-expanded={menuOpen}
            onClick={() => {
              setMenuOpen(true);
            }}
          >
            <Menu className="size-5" />
          </Button>
          <div className="flex-1" />
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <UserMenu locale={locale} />
        </header>
        <main id="admin-main" tabIndex={-1} className="p-row md:p-frame flex-1">
          <Outlet />
        </main>
      </div>
      <RouteAnnouncer />
    </div>
  );
}
