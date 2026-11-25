import { publicEnv } from '@/shared/env/public-env';
import { getFixedT } from '@/shared/lib/i18n/create-i18n';
import type { Locale } from '@/shared/lib/i18n/languages';
import { breadcrumbJsonLd } from '@/shared/lib/seo/jsonld';
import { seo } from '@/shared/lib/seo/seo';

export function aboutHead(locale: Locale) {
  const t = getFixedT(locale);
  return seo({
    locale,
    path: '/about',
    title: t('about.metaTitle'),
    description: t('about.metaDescription'),
    jsonLd: [
      breadcrumbJsonLd(publicEnv.VITE_SITE_URL, locale, [
        { name: t('nav.home'), path: '' },
        { name: t('nav.about'), path: '/about' },
      ]),
    ],
  });
}
