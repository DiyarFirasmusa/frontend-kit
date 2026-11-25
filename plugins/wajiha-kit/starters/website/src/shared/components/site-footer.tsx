import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { NAV } from '@/config/nav.config';
import { SITE, siteName } from '@/config/site.config';
import { Container } from '@/shared/components/container';
import type { Locale } from '@/shared/lib/i18n/languages';

export function SiteFooter({ locale }: { locale: Locale }) {
  const { t } = useTranslation();
  return (
    <footer className="mt-section border-border bg-surface-sunken border-t py-10">
      <Container className="grid gap-8 md:grid-cols-3">
        <div>
          <p className="text-lg font-bold">{siteName(locale)}</p>
          <p className="text-muted mt-2 text-sm">{t('footer.blurb')}</p>
        </div>
        <nav aria-label={t('footer.pages')}>
          <p className="font-bold">{t('footer.pages')}</p>
          <ul className="mt-2 flex flex-col">
            {NAV.map((item) => (
              <li key={item.id}>
                <Link
                  to={item.to}
                  params={{ locale }}
                  className="text-muted hover:text-text inline-flex min-h-11 items-center underline-offset-4 hover:underline"
                >
                  {t(item.labelKey)}
                </Link>
              </li>
            ))}
          </ul>
        </nav>
        <div>
          <p className="font-bold">{t('footer.contactTitle')}</p>
          <ul className="text-muted mt-2 space-y-1 text-sm">
            <li>
              <a
                href={`mailto:${SITE.email}`}
                className="hover:text-text inline-flex min-h-11 items-center underline underline-offset-4"
              >
                {SITE.email}
              </a>
            </li>
            <li dir="ltr" className="text-start">
              {SITE.phone}
            </li>
            <li>{t('footer.address')}</li>
          </ul>
        </div>
      </Container>
      <Container className="border-border text-muted mt-8 border-t pt-6 text-sm">
        {t('footer.rights')}
      </Container>
    </footer>
  );
}
