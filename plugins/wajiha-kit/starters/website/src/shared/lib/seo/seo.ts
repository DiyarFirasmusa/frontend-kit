// The one function every page route calls from head(). No component writes <title> or <meta>.
import { SITE, siteName } from '@/config/site.config';
import { publicEnv } from '@/shared/env/public-env';
import { LANGUAGES, LOCALES, type Locale } from '@/shared/lib/i18n/languages';
import { serializeJsonLd, type JsonLd } from './jsonld';
import { absoluteUrl, alternateLinks, canonicalUrl, type SeoEnv } from './site';

export type SeoInput = {
  locale: Locale;
  /** Language-free path: '' (home), '/about', '/news/some-slug'. */
  path: string;
  title: string;
  description: string;
  /** Path or absolute URL of the share image. Defaults to the site image. */
  image?: string;
  imageAlt?: string;
  type?: 'website' | 'article';
  publishedTime?: string;
  /** Private or utility pages (404, error): noindex and no language alternates. */
  noindex?: boolean;
  jsonLd?: readonly JsonLd[];
};

type Meta =
  | { title: string }
  | { name: string; content: string }
  | { property: string; content: string };
type LinkTag = { rel: string; href: string; hrefLang?: string };
type ScriptTag = { type: string; children: string };
export type HeadParts = { meta: Meta[]; links: LinkTag[]; scripts: ScriptTag[] };

const defaultEnv = (): SeoEnv => ({
  siteUrl: publicEnv.VITE_SITE_URL,
  allowIndexing: publicEnv.VITE_ALLOW_INDEXING,
});

export function fullTitle(title: string, locale: Locale, isHome: boolean): string {
  return isHome ? title : `${title} | ${siteName(locale)}`;
}

export function seo(input: SeoInput, env: SeoEnv = defaultEnv()): HeadParts {
  const { locale, path, description } = input;
  const isHome = path === '' || path === '/';
  const title = fullTitle(input.title, locale, isHome);
  const url = canonicalUrl(env.siteUrl, locale, path);
  const imagePath = input.image ?? SITE.ogImage.path;
  const imageUrl = /^https?:\/\//.test(imagePath) ? imagePath : absoluteUrl(env.siteUrl, imagePath);
  const isDefaultImage = input.image === undefined;
  const indexable = env.allowIndexing && input.noindex !== true;

  const meta: Meta[] = [
    { title },
    { name: 'description', content: description },
    {
      name: 'robots',
      content: indexable
        ? 'index, follow, max-image-preview:large, max-snippet:-1'
        : 'noindex, nofollow',
    },
    { property: 'og:type', content: input.type ?? 'website' },
    { property: 'og:site_name', content: siteName(locale) },
    { property: 'og:title', content: title },
    { property: 'og:description', content: description },
    { property: 'og:url', content: url },
    { property: 'og:locale', content: LANGUAGES[locale].ogLocale },
    { property: 'og:image', content: imageUrl },
    { name: 'twitter:card', content: 'summary_large_image' },
    { name: 'twitter:title', content: title },
    { name: 'twitter:description', content: description },
    { name: 'twitter:image', content: imageUrl },
  ];
  if (input.imageAlt !== undefined) {
    meta.push({ property: 'og:image:alt', content: input.imageAlt });
    meta.push({ name: 'twitter:image:alt', content: input.imageAlt });
  }
  if (isDefaultImage) {
    meta.push({ property: 'og:image:width', content: String(SITE.ogImage.width) });
    meta.push({ property: 'og:image:height', content: String(SITE.ogImage.height) });
  }
  if (input.noindex !== true) {
    for (const other of LOCALES.filter((candidate) => candidate !== locale)) {
      meta.push({ property: 'og:locale:alternate', content: LANGUAGES[other].ogLocale });
    }
  }
  if (input.type === 'article' && input.publishedTime !== undefined) {
    meta.push({ property: 'article:published_time', content: input.publishedTime });
  }

  // Set on the leaf route only: link tags from nested routes are not de-duplicated.
  const links: LinkTag[] =
    input.noindex === true
      ? []
      : [
          { rel: 'canonical', href: url },
          ...alternateLinks(env.siteUrl, path).map((alt) => ({
            rel: 'alternate',
            hrefLang: alt.hrefLang,
            href: alt.href,
          })),
        ];

  const scripts: ScriptTag[] =
    input.noindex === true || input.jsonLd === undefined
      ? []
      : input.jsonLd.map((data) => ({
          type: 'application/ld+json',
          children: serializeJsonLd(data),
        }));

  return { meta, links, scripts };
}
