import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { NAV } from '@/config/nav.config';
import { siteName } from '@/config/site.config';
import { Container } from '@/shared/components/container';
import { CloseIcon, MenuIcon } from '@/shared/components/icons';
import { LanguageSwitcher } from '@/shared/components/language-switcher';
import { ThemeToggle } from '@/shared/components/theme-toggle';
import type { Locale } from '@/shared/lib/i18n/languages';
import { useMenuStore } from '@/shared/store/menu-store';
import { cx } from '@/shared/utils/cx';

const linkClass =
  'flex min-h-11 items-center rounded-md px-3 font-semibold text-text hover:bg-surface-sunken aria-[current=page]:text-primary aria-[current=page]:underline aria-[current=page]:underline-offset-8';

export function SiteHeader({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  const open = useMenuStore((state) => state.open);
  const toggle = useMenuStore((state) => state.toggle);
  const setOpen = useMenuStore((state) => state.setOpen);

  return (
    <header className="border-border bg-bg sticky top-0 z-40 border-b">
      <Container className="flex items-center gap-3 py-2">
        <Link
          to="/$locale"
          params={{ locale }}
          className="text-text flex min-h-11 items-center gap-2 text-lg font-bold"
        >
          <img src="/favicon.svg" alt="" width="32" height="32" className="size-8" />
          <span>{siteName(locale)}</span>
        </Link>

        <nav
          id="site-nav"
          aria-label={t('nav.main')}
          className={cx(
            'absolute inset-x-0 top-full flex-col gap-1 border-b border-border bg-bg p-gutter',
            'md:static md:ms-4 md:flex md:flex-row md:border-0 md:p-0',
            open ? 'flex' : 'hidden',
          )}
        >
          {NAV.map((item) => (
            <Link
              key={item.id}
              to={item.to}
              params={{ locale }}
              activeOptions={{ exact: item.path === '' }}
              className={linkClass}
              onClick={() => setOpen(false)}
            >
              {t(item.labelKey)}
            </Link>
          ))}
        </nav>

        <div className="ms-auto flex items-center gap-2">
          <LanguageSwitcher locale={locale} />
          <ThemeToggle />
          <button
            type="button"
            onClick={toggle}
            aria-expanded={open}
            aria-controls="site-nav"
            aria-label={open ? t('nav.closeMenu') : t('nav.openMenu')}
            className="border-border bg-surface text-text hover:bg-surface-sunken inline-flex size-11 items-center justify-center rounded-md border md:hidden"
          >
            {open ? <CloseIcon /> : <MenuIcon />}
          </button>
        </div>
      </Container>
    </header>
  );
}
