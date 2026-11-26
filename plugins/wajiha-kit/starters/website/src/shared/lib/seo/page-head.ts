import { NAV, navItemFor, type PageRoute } from '@/config/nav.config';
import { publicEnv } from '@/shared/env/public-env';
import { getFixedT } from '@/shared/lib/i18n/create-i18n';
import type { Locale } from '@/shared/lib/i18n/languages';
import { breadcrumbJsonLd } from './jsonld';
import { seo, type HeadParts } from './seo';

/**
 * The head of a plain page (about, services, news, contact, any NAV entry except the home page): title and
 * description from the entry's keys, canonical and alternates from its path, and a Home > page breadcrumb.
 * Home and the article have their own heads because their structured data differs.
 */
export function pageHead(locale: Locale, to: PageRoute): HeadParts {
  const item = navItemFor(to);
  const home = NAV.find((entry) => entry.path === '');
  const t = getFixedT(locale);
  return seo({
    locale,
    path: item.path,
    title: t(item.metaTitleKey),
    description: t(item.metaDescriptionKey),
    jsonLd: [
      breadcrumbJsonLd(publicEnv.VITE_SITE_URL, locale, [
        { name: t(home?.labelKey ?? 'nav.home'), path: '' },
        { name: t(item.labelKey), path: item.path },
      ]),
    ],
  });
}
