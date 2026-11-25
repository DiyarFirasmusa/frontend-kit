import { getRouteApi } from '@tanstack/react-router';
import { toLocale } from '@/shared/lib/i18n/languages';
import { sortedArticles } from '../news/data/articles';

const route = getRouteApi('/$locale/');

/** The two newest articles in the page language, as plain card props. */
export function useHomePage() {
  const locale = toLocale(route.useParams().locale);
  const latest = sortedArticles()
    .slice(0, 2)
    .map((article) => {
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
  return { locale, latest };
}
