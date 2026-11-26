import { createFileRoute, notFound } from '@tanstack/react-router';

// Any URL no other route matches: an unknown language (/fr/about, /zz), a stray file name. A real 404 whose
// match carries `status: 'notFound'`, so __root.tsx gives it a title and `noindex` like every failed page.
export const Route = createFileRoute('/$')({
  loader: () => {
    throw notFound();
  },
});
