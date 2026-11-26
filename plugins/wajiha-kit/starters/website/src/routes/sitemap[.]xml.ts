import { createFileRoute } from '@tanstack/react-router';
import { siteSitemapEntries } from '@/content/sitemap-entries';
import { publicEnv } from '@/shared/env/public-env';
import { buildSitemapXml } from '@/shared/lib/seo/sitemap';

export const Route = createFileRoute('/sitemap.xml')({
  server: {
    handlers: {
      GET: async () =>
        new Response(buildSitemapXml(await siteSitemapEntries(), publicEnv.VITE_SITE_URL), {
          headers: {
            'Content-Type': 'application/xml; charset=utf-8',
            'Cache-Control': 'public, max-age=0, s-maxage=3600',
          },
        }),
    },
  },
});
