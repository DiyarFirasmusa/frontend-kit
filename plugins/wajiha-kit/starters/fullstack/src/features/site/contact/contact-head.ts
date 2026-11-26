import { getFixedT } from '@/features/site/i18n/resources';
import { publicEnv } from '@/shared/env/public-env';
import type { Locale } from '@/shared/lib/i18n/languages';
import { breadcrumbJsonLd } from '@/shared/lib/seo/jsonld';
import { seo } from '@/shared/lib/seo/seo';

export function contactHead(locale: Locale) {
  const t = getFixedT(locale);
  return seo({
    locale,
    path: '/contact',
    title: t('contact.metaTitle'),
    description: t('contact.metaDescription'),
    jsonLd: [
      breadcrumbJsonLd(publicEnv.VITE_SITE_URL, locale, [
        { name: t('nav.home'), path: '' },
        { name: t('nav.contact'), path: '/contact' },
      ]),
    ],
  });
}
