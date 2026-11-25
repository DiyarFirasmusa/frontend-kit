import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { ArrowIcon } from '@/shared/components/icons';
import { Picture } from '@/shared/components/picture';
import type { Locale } from '@/shared/lib/i18n/languages';
import { formatDate } from '@/shared/utils/format-date';

export type ArticleCardProps = {
  locale: Locale;
  slug: string;
  title: string;
  summary: string;
  date: string;
  cover: string;
  coverAlt: string;
  /** h2 when the cards sit right under the page's h1 (the news list), h3 under a section h2 (default). */
  headingLevel?: 'h2' | 'h3';
};

/** Takes plain values, not a news record, so any feature can show an article without importing the news feature. */
export function ArticleCard({
  locale,
  slug,
  title,
  summary,
  date,
  cover,
  coverAlt,
  headingLevel: Heading = 'h3',
}: ArticleCardProps) {
  const { t } = useTranslation();
  return (
    <article className="border-border bg-surface shadow-card flex flex-col overflow-hidden rounded-lg border">
      <Picture
        src={cover}
        alt={coverAlt}
        width={640}
        height={360}
        className="aspect-video w-full object-cover"
      />
      <div className="flex flex-1 flex-col p-6">
        <time dateTime={date} className="text-muted text-sm">
          {formatDate(locale, date)}
        </time>
        <Heading className="mt-2 text-xl">
          <Link
            to="/$locale/news/$slug"
            params={{ locale, slug }}
            className="text-text underline-offset-4 hover:underline"
          >
            {title}
          </Link>
        </Heading>
        <p className="text-muted mt-2 flex-1">{summary}</p>
        <Link
          to="/$locale/news/$slug"
          params={{ locale, slug }}
          aria-label={`${t('common.readMore')}: ${title}`}
          className="text-primary mt-4 inline-flex min-h-11 items-center gap-2 font-semibold underline underline-offset-4"
        >
          {t('common.readMore')}
          <ArrowIcon />
        </Link>
      </div>
    </article>
  );
}
