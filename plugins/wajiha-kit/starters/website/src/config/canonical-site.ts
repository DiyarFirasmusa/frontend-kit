// What the server needs to know about the site's URLs to redirect to the one spelling of a page that exists
// (src/shared/server/canonical-redirect.ts). Static pages come from NAV; a page with a slug needs one line here:
// the parent segment and the function that finds a slug's stored spelling. src/routing.test.ts fails when a
// route like /$locale/<parent>/$slug has no line.
import { resolveArticleSlug } from '@/content/articles';
import type { CanonicalSite } from '@/shared/server/canonical-redirect';
import { PAGE_PATHS, PAGE_SEGMENTS } from './nav.config';

export const CANONICAL_SITE: CanonicalSite = {
  staticSegments: PAGE_SEGMENTS,
  pagePaths: PAGE_PATHS,
  slugRoutes: { news: resolveArticleSlug },
};
