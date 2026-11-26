import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Container } from '@/components/common/container';
import { ArrowIcon } from '@/components/common/icons';
import { Picture } from '@/components/common/picture';
import { ArticleCard } from '@/features/site/components/article-card';
import { formatDate } from '@/shared/utils/format-date';
import { useArticlePage } from './use-article-page';

export function ArticlePage() {
  const { t } = useTranslation();
  const { locale, text, date, cover, readMinutes, related } = useArticlePage();
  return (
    <>
      <Container className="pt-10">
        <Link
          to="/$locale/news"
          params={{ locale }}
          className="text-primary-text inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
        >
          <ArrowIcon className="rotate-180" />
          {t('news.backToList')}
        </Link>
      </Container>
      <article>
        <Container size="prose" className="pt-4">
          <h1 className="text-4xl">{text.title}</h1>
          <p className="text-text-muted mt-4">
            <time dateTime={date}>{t('news.publishedOn', { date: formatDate(locale, date) })}</time>
            {' · '}
            {t('news.readTime', { count: readMinutes })}
          </p>
          <Picture
            src={cover}
            alt={text.coverAlt}
            width={640}
            height={360}
            priority
            className="mt-8 aspect-video w-full rounded-lg object-cover"
          />
          <div className="mt-8 space-y-5">
            {text.body.map((paragraph) => (
              <p key={paragraph}>{paragraph}</p>
            ))}
          </div>
        </Container>
      </article>
      <Container className="pt-section">
        <h2 className="text-3xl">{t('news.related')}</h2>
        <div className="mt-8 grid gap-6 md:grid-cols-2">
          {related.map((card) => (
            <ArticleCard key={card.slug} locale={locale} {...card} />
          ))}
        </div>
      </Container>
    </>
  );
}
