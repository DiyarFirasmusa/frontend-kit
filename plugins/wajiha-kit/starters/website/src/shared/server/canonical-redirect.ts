// The one 301 a page URL can get, and only when its target exists. A visitor (or a mail client that capitalised
// a link) who types /EN/NEWS/Plan-Your-First-Quarter/ lands on the real page in one hop; a URL that names
// nothing is answered 404 right away, never redirected to a page that then answers 404.
//   - structure: repeated and trailing slashes, the case of the language and the static pages (canonicalPath)
//   - a slug (the news/<slug> kind of route, one resolver each in SlugRoutes) is matched ignoring case and
//     redirected to its stored spelling, which is also what canonicalUrl and the sitemap print
import { isLocale } from '@/shared/lib/i18n/languages';
import { encodePathSegment } from '@/shared/lib/seo/site';
import { canonicalPath, isPageRequest } from './security-headers';

/** The stored spelling of a slug (matched ignoring case, given decoded), or undefined when nothing has it. */
export type SlugResolver = (slug: string) => Promise<string | undefined>;

export type CanonicalSite = {
  /** Static path segments ('about', 'news'): lowercased by the canonical rules. */
  staticSegments: ReadonlySet<string>;
  /** Language-free path of every page without a parameter: '', '/about', ... */
  pagePaths: ReadonlySet<string>;
  /** Pages with a slug, by their parent segment: `{ news: resolveArticleSlug }` is /<language>/news/<slug>. */
  slugRoutes: Readonly<Record<string, SlugResolver>>;
};

function decode(segment: string): string | undefined {
  try {
    return decodeURIComponent(segment);
  } catch {
    return undefined;
  }
}

/** The canonical path when `path` (already structurally canonical) names a page that exists, else undefined. */
async function existingPath(path: string, site: CanonicalSite): Promise<string | undefined> {
  if (path === '/') {
    return path;
  }
  const [, language = '', ...rest] = path.split('/');
  if (!isLocale(language)) {
    return undefined;
  }
  if (rest.length === 0 || site.pagePaths.has(`/${rest.join('/')}`)) {
    return path;
  }
  const [parent = '', slug, ...extra] = rest;
  const resolve = Object.hasOwn(site.slugRoutes, parent) ? site.slugRoutes[parent] : undefined;
  const decoded = slug === undefined ? undefined : decode(slug);
  if (resolve === undefined || decoded === undefined || extra.length > 0) {
    return undefined;
  }
  const stored = await resolve(decoded);
  return stored === undefined ? undefined : `/${language}/${parent}/${encodePathSegment(stored)}`;
}

/**
 * Where a GET or HEAD for a page should go in one 301 hop, or undefined: the path is already canonical, it
 * is not a page (assets, files, server functions), or its canonical form does not exist (the router then
 * answers the 404 for the URL as it was written, with no redirect in front of it).
 */
export async function canonicalRedirectIfExists(
  url: URL,
  method: string,
  site: CanonicalSite,
): Promise<string | undefined> {
  const { pathname, search } = url;
  if (!isPageRequest(method, pathname)) {
    return undefined;
  }
  const target = await existingPath(canonicalPath(pathname, site.staticSegments), site);
  return target === undefined || target === pathname ? undefined : `${target}${search}`;
}
