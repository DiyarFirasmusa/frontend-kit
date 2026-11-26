import { getRouteApi } from '@tanstack/react-router';

const route = getRouteApi('/$locale/news/');

export function useNewsListPage() {
  const { locale } = route.useParams();
  const { cards } = route.useLoaderData();
  return { locale, cards };
}
