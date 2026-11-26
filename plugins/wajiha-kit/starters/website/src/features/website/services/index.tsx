import { getRouteApi, Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { buttonPrimary, card } from '@/shared/components/button-styles';
import { Container } from '@/shared/components/container';
import { PageHeader } from '@/shared/components/page-header';

const route = getRouteApi('/$locale/services');

const SERVICES = [
  { title: 'services.consultingTitle', text: 'services.consultingText' },
  { title: 'services.trainingTitle', text: 'services.trainingText' },
  { title: 'services.supportTitle', text: 'services.supportText' },
  { title: 'services.reviewTitle', text: 'services.reviewText' },
] as const;

const STEPS = [
  { title: 'services.step1Title', text: 'services.step1Text' },
  { title: 'services.step2Title', text: 'services.step2Text' },
  { title: 'services.step3Title', text: 'services.step3Text' },
] as const;

export function ServicesPage() {
  const { t } = useTranslation();
  const { locale } = route.useParams();
  return (
    <>
      <PageHeader title={t('services.title')} lead={t('services.lead')} />
      <Container className="pt-section">
        <ul className="grid gap-6 md:grid-cols-2">
          {SERVICES.map((service) => (
            <li key={service.title} className={card}>
              <h2 className="text-2xl">{t(service.title)}</h2>
              <p className="text-muted mt-2">{t(service.text)}</p>
            </li>
          ))}
        </ul>

        <section className="pt-section">
          <h2 className="text-3xl">{t('services.processTitle')}</h2>
          <ol className="mt-8 grid gap-6 md:grid-cols-3">
            {STEPS.map((step, index) => (
              <li key={step.title} className={card}>
                <span aria-hidden="true" className="text-accent text-3xl font-bold">
                  {index + 1}
                </span>
                <h3 className="mt-2 text-xl">{t(step.title)}</h3>
                <p className="text-muted mt-2">{t(step.text)}</p>
              </li>
            ))}
          </ol>
        </section>

        <section className="pt-section">
          <h2 className="text-3xl">{t('services.ctaTitle')}</h2>
          <Link to="/$locale/contact" params={{ locale }} className={`${buttonPrimary} mt-6`}>
            {t('services.ctaButton')}
          </Link>
        </section>
      </Container>
    </>
  );
}
