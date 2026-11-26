// Which pages are in the sitemap: the navigation list plus every article. A page added to NAV or to the
// content shows up here without anyone remembering the sitemap.
import { NAV } from '@/config/nav.config';
import type { SitemapEntry } from '@/shared/lib/seo/sitemap';
import { listArticleEntries } from './articles';

export async function siteSitemapEntries(): Promise<SitemapEntry[]> {
  const pages: SitemapEntry[] = NAV.map((item) => ({
    path: item.path,
    changefreq: item.changefreq,
    priority: item.priority,
  }));
  const articles: SitemapEntry[] = (await listArticleEntries()).map((article) => ({
    path: `/news/${article.slug}`,
    lastmod: article.date,
    changefreq: 'monthly',
    priority: 0.5,
  }));
  return [...pages, ...articles];
}
