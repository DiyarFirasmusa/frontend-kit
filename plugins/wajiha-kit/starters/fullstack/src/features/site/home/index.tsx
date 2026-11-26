import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { buttonPrimary, buttonSecondary, card } from '@/components/common/button-styles';
import { Container } from '@/components/common/container';
import { ArticleCard } from '@/features/site/components/article-card';
import { useHomePage } from './use-home-page';

const SERVICE_KEYS = [
  { title: 'home.service1Title', text: 'home.service1Text' },
  { title: 'home.service2Title', text: 'home.service2Text' },
  { title: 'home.service3Title', text: 'home.service3Text' },
] as const;

const STAT_KEYS = [
  { value: 'home.stat1Value', label: 'home.stat1Label' },
  { value: 'home.stat2Value', label: 'home.stat2Label' },
  { value: 'home.stat3Value', label: 'home.stat3Label' },
] as const;

export function HomePage() {
  const { t } = useTranslation();
  const { locale, latest } = useHomePage();

  return (
    <>
      <section className="border-stroke bg-muted py-section border-b">
        <Container>
          <h1 className="max-w-3xl text-4xl">{t('home.heroTitle')}</h1>
          <p className="text-text-muted mt-5 max-w-prose text-lg">{t('home.heroText')}</p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link to="/$locale/contact" params={{ locale }} className={buttonPrimary}>
              {t('home.heroPrimary')}
            </Link>
            <Link to="/$locale/services" params={{ locale }} className={buttonSecondary}>
              {t('home.heroSecondary')}
            </Link>
          </div>
        </Container>
      </section>

      <section className="pt-section">
        <Container>
          <h2 className="text-3xl">{t('home.servicesTitle')}</h2>
          <p className="text-text-muted mt-3 max-w-prose">{t('home.servicesLead')}</p>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {SERVICE_KEYS.map((service) => (
              <li key={service.title} className={card}>
                <h3 className="text-xl">{t(service.title)}</h3>
                <p className="text-text-muted mt-2">{t(service.text)}</p>
              </li>
            ))}
          </ul>
        </Container>
      </section>

      <section className="pt-section" aria-labelledby="home-stats">
        <Container>
          <h2 id="home-stats" className="text-3xl">
            {t('home.statsTitle')}
          </h2>
          <dl className="mt-8 grid gap-6 sm:grid-cols-3">
            {STAT_KEYS.map((stat) => (
              <div key={stat.value} className={card}>
                <dt className="text-text-muted">{t(stat.label)}</dt>
                <dd className="text-primary-text mt-1 text-4xl font-bold">{t(stat.value)}</dd>
              </div>
            ))}
          </dl>
        </Container>
      </section>

      <section className="pt-section">
        <Container>
          <div className="flex flex-wrap items-end justify-between gap-4">
            <h2 className="text-3xl">{t('home.newsTitle')}</h2>
            <Link
              to="/$locale/news"
              params={{ locale }}
              className="text-primary-text inline-flex min-h-11 items-center font-semibold underline underline-offset-4"
            >
              {t('common.viewAll')}
            </Link>
          </div>
          <div className="mt-8 grid gap-6 md:grid-cols-2">
            {latest.map((article) => (
              <ArticleCard key={article.slug} locale={locale} {...article} />
            ))}
          </div>
        </Container>
      </section>

      <section className="pt-section">
        <Container>
          <div className="surface-primary rounded-lg p-8 md:p-12" data-testid="home-cta">
            <h2 className="text-3xl">{t('home.ctaTitle')}</h2>
            <p className="mt-3 max-w-prose text-lg">{t('home.ctaText')}</p>
            <Link
              to="/$locale/contact"
              params={{ locale }}
              className="bg-surface text-text-primary hover:bg-muted mt-6 inline-flex min-h-11 items-center rounded-md px-5 py-2.5 font-semibold"
            >
              {t('home.ctaButton')}
            </Link>
          </div>
        </Container>
      </section>
    </>
  );
}
