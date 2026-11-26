import { getRouteApi } from '@tanstack/react-router';
import { toLocale } from '@/shared/lib/i18n/languages';
import { articleCard, sortedArticles } from './data/articles';

const route = getRouteApi('/$locale/news/');

export function useNewsListPage() {
  const locale = toLocale(route.useParams().locale);
  const cards = sortedArticles().map((article) => articleCard(article, locale));
  return { locale, cards };
}
