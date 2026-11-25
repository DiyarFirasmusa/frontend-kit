import { publicEnv } from '@/shared/env/public-env';
import { getFixedT } from '@/shared/lib/i18n/create-i18n';
import type { Locale } from '@/shared/lib/i18n/languages';
import { articleJsonLd, breadcrumbJsonLd } from '@/shared/lib/seo/jsonld';
import { seo, type HeadParts } from '@/shared/lib/seo/seo';
import { findArticle } from '../../data/articles';

/** Head for one article. Called with loaderData, so an unknown slug (404) simply adds nothing. */
export function articleHead(locale: Locale, slug: string | undefined): HeadParts {
  const article = slug === undefined ? undefined : findArticle(slug);
  if (article === undefined) {
    return { meta: [], links: [], scripts: [] };
  }
  const t = getFixedT(locale);
  const text = article.text[locale];
  const path = `/news/${article.slug}`;
  const siteUrl = publicEnv.VITE_SITE_URL;
  return seo({
    locale,
    path,
    title: text.title,
    description: text.summary,
    // No `image`: the covers are SVG and chat apps cannot read SVG, so the default PNG share image is used.
    type: 'article',
    publishedTime: article.date,
    jsonLd: [
      articleJsonLd(siteUrl, locale, {
        headline: text.title,
        description: text.summary,
        path,
        datePublished: article.date,
        image: article.cover,
      }),
      breadcrumbJsonLd(siteUrl, locale, [
        { name: t('nav.home'), path: '' },
        { name: t('nav.news'), path: '/news' },
        { name: text.title, path },
      ]),
    ],
  });
}
