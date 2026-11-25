import { useTranslation } from 'react-i18next';
import { ArticleCard } from '@/shared/components/article-card';
import { Container } from '@/shared/components/container';
import { PageHeader } from '@/shared/components/page-header';
import { useNewsListPage } from './use-news-list-page';

export function NewsListPage() {
  const { t } = useTranslation();
  const { locale, cards } = useNewsListPage();
  return (
    <>
      <PageHeader title={t('news.title')} lead={t('news.lead')} />
      <Container className="pt-section">
        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          {cards.map((card) => (
            <ArticleCard key={card.slug} locale={locale} headingLevel="h2" {...card} />
          ))}
        </div>
      </Container>
    </>
  );
}
