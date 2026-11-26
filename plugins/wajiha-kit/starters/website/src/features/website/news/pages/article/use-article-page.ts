import { getRouteApi } from '@tanstack/react-router';
import { toLocale } from '@/shared/lib/i18n/languages';
import { articleCard, findArticle, sortedArticles } from '../../data/articles';

const route = getRouteApi('/$locale/news/$slug');

export function useArticlePage() {
  const params = route.useParams();
  const locale = toLocale(params.locale);
  const article = findArticle(params.slug);
  if (article === undefined) {
    // The loader already threw notFound(); this only narrows the type.
    throw new Error('article missing after the loader ran');
  }
  const text = article.text[locale];
  const related = sortedArticles()
    .filter((other) => other.slug !== article.slug)
    .slice(0, 2)
    .map((other) => articleCard(other, locale));
  return {
    locale,
    text,
    date: article.date,
    cover: article.cover,
    readMinutes: article.readMinutes,
    related,
  };
}
