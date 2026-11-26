import { createFileRoute, notFound } from '@tanstack/react-router';
import { NotFound } from '@/features/fallback/not-found';

// Any URL under a valid language that no page matches (/en/nothing). It throws notFound() like a missing
// article does and draws the 404 itself, so the page stays inside the header and footer, and the match carries
// the public `status: 'notFound'` that __root.tsx reads for the title and the robots meta.
export const Route = createFileRoute('/$locale/$')({
  loader: () => {
    throw notFound();
  },
  notFoundComponent: NotFound,
});
