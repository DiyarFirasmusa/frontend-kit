import { getFixedT } from '@/features/site/i18n/resources';
import { publicEnv } from '@/shared/env/public-env';
import type { Locale } from '@/shared/lib/i18n/languages';
import { breadcrumbJsonLd } from '@/shared/lib/seo/jsonld';
import { seo } from '@/shared/lib/seo/seo';

export function servicesHead(locale: Locale) {
  const t = getFixedT(locale);
  return seo({
    locale,
    path: '/services',
    title: t('services.metaTitle'),
    description: t('services.metaDescription'),
    jsonLd: [
      breadcrumbJsonLd(publicEnv.VITE_SITE_URL, locale, [
        { name: t('nav.home'), path: '' },
        { name: t('nav.services'), path: '/services' },
      ]),
    ],
  });
}
