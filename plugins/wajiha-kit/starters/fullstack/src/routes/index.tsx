import { createFileRoute } from '@tanstack/react-router';
import { redirectToLocale } from '@/shared/server/root-redirect';

// "/" is only a doorway to /ar or /en; it renders no page.
export const Route = createFileRoute('/')({
  server: {
    handlers: {
      GET: ({ request }) => redirectToLocale(request),
      HEAD: ({ request }) => redirectToLocale(request),
    },
  },
});
