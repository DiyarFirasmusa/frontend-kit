import type { Article } from '@/content/types';
import { publicEnv } from '@/shared/env/public-env';
import { getFixedT } from '@/shared/lib/i18n/create-i18n';
import type { Locale } from '@/shared/lib/i18n/languages';
import { articleJsonLd, breadcrumbJsonLd } from '@/shared/lib/seo/jsonld';
import { seo, type HeadParts } from '@/shared/lib/seo/seo';

/** Head for one article, from the loader's data. A missing article (404) has none, so it adds nothing. */
export function articleHead(locale: Locale, article: Article | undefined): HeadParts {
  if (article === undefined) {
    return { meta: [], links: [], scripts: [] };
  }
  const t = getFixedT(locale);
  const path = `/news/${article.slug}`;
  const siteUrl = publicEnv.VITE_SITE_URL;
  return seo({
    locale,
    path,
    title: article.title,
    description: article.summary,
    // No `image`: the covers are SVG and chat apps cannot read SVG, so the default PNG share image is used.
    type: 'article',
    publishedTime: article.date,
    jsonLd: [
      articleJsonLd(siteUrl, locale, {
        headline: article.title,
        description: article.summary,
        path,
        datePublished: article.date,
        image: article.cover,
      }),
      breadcrumbJsonLd(siteUrl, locale, [
        { name: t('nav.home'), path: '' },
        { name: t('nav.news'), path: '/news' },
        { name: article.title, path },
      ]),
    ],
  });
}
