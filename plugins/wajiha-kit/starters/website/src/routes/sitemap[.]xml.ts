import { createFileRoute } from '@tanstack/react-router';
import { publicEnv } from '@/shared/env/public-env';
import { siteSitemapEntries } from '@/shared/lib/seo/site-entries';
import { buildSitemapXml } from '@/shared/lib/seo/sitemap';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: () =>
        new Response(buildSitemapXml(siteSitemapEntries(), publicEnv.VITE_SITE_URL), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=3600',
          },
        }),
    },
  },
});
