import { getRouteApi } from '@tanstack/react-router';

const route = getRouteApi('/$locale/');

/** The two newest articles in the page language, as plain card props (from the route loader). */
export function useHomePage() {
  const { locale } = route.useParams();
  const { latest } = route.useLoaderData();
  return { locale, latest };
}
