import { createFileRoute } from '@tanstack/react-router';
import { publicEnv } from '@/shared/env/public-env';
import { buildRobotsTxt } from '@/shared/lib/seo/sitemap';

export const Route = createFileRoute('/robots.txt')({
  server: {
    handlers: {
      GET: () =>
        new Response(
          buildRobotsTxt({
            siteUrl: publicEnv.VITE_SITE_URL,
            allowIndexing: publicEnv.VITE_ALLOW_INDEXING,
          }),
          {
            headers: {
              'Content-Type': 'text/plain; charset=utf-8',
              'Cache-Control': 'public, max-age=0, s-maxage=3600',
            },
          },
        ),
    },
  },
});
