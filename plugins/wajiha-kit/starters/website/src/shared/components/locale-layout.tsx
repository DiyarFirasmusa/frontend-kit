import { Outlet } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { RouteAnnouncer } from '@/shared/components/route-announcer';
import { SiteFooter } from '@/shared/components/site-footer';
import { SiteHeader } from '@/shared/components/site-header';
import type { Locale } from '@/shared/lib/i18n/languages';

/** Header, main content and footer for every page under /ar and /en. */
export function LocaleLayout({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  return (
    <>
      <a
        href="#main"
        className="bg-primary text-on-primary absolute start-2 -top-16 z-50 rounded-md px-4 py-2 font-semibold focus:top-2"
      >
        {t('common.skipToContent')}
      </a>
      <SiteHeader locale={locale} />
      <main id="main" tabIndex={-1}>
        <Outlet />
      </main>
      <SiteFooter locale={locale} />
      <RouteAnnouncer />
    </>
  );
}
