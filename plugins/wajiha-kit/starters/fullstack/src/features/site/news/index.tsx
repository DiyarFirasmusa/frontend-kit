import { useTranslation } from 'react-i18next';
import { Container } from '@/components/common/container';
import { ArticleCard } from '@/features/site/components/article-card';
import { PageHeader } from '@/features/site/components/page-header';
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
