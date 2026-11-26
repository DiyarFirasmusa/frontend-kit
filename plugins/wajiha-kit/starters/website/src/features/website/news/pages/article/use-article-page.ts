import { getRouteApi } from '@tanstack/react-router';

const route = getRouteApi('/$locale/news/$slug');

/** The article and its related cards come from the route loader; the language comes typed from the route. */
export function useArticlePage() {
  const { locale } = route.useParams();
  const { article, related } = route.useLoaderData();
  return { locale, article, related };
}
