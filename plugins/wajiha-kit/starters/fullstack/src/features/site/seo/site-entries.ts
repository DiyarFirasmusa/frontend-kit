// Which pages are in the sitemap: the navigation list plus every article. A page added to NAV or to the
// article list shows up here without anyone remembering the sitemap.
import { NAV } from '@/features/site/config/nav.config';
import { ARTICLES } from '@/features/site/news/data/articles';
import type { SitemapEntry } from '@/shared/lib/seo/sitemap';

export function siteSitemapEntries(): SitemapEntry[] {
  const pages: SitemapEntry[] = NAV.map((item) => ({
    path: item.path,
    changefreq: item.changefreq,
    priority: item.priority,
  }));
  const articles: SitemapEntry[] = ARTICLES.map((article) => ({
    path: `/news/${article.slug}`,
    lastmod: article.date,
    changefreq: 'monthly',
    priority: 0.5,
  }));
  return [...pages, ...articles];
}
