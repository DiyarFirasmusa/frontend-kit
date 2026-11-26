import { getRouteApi } from '@tanstack/react-router';
import { toLocale } from '@/shared/lib/i18n/languages';
import { sortedArticles } from './data/articles';

const route = getRouteApi('/$locale/news/');

export function useNewsListPage() {
  const locale = toLocale(route.useParams().locale);
  const cards = sortedArticles().map((article) => {
    const text = article.text[locale];
    return {
      slug: article.slug,
      title: text.title,
      summary: text.summary,
      date: article.date,
      cover: article.cover,
      coverAlt: text.coverAlt,
    };
  });
  return { locale, cards };
}
