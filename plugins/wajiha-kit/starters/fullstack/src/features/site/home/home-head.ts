import { getFixedT } from '@/features/site/i18n/resources';
import { publicEnv } from '@/shared/env/public-env';
import type { Locale } from '@/shared/lib/i18n/languages';
import { organizationJsonLd, websiteJsonLd } from '@/shared/lib/seo/jsonld';
import { seo } from '@/shared/lib/seo/seo';

export function homeHead(locale: Locale) {
  const t = getFixedT(locale);
  const siteUrl = publicEnv.VITE_SITE_URL;
  return seo({
    locale,
    path: '',
    title: t('home.metaTitle'),
    description: t('home.metaDescription'),
    jsonLd: [organizationJsonLd(siteUrl, locale), websiteJsonLd(siteUrl, locale)],
  });
}
