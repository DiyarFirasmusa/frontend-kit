import { useTranslation } from 'react-i18next';
import { card } from '@/components/common/button-styles';
import { Container } from '@/components/common/container';
import { PageHeader } from '@/features/site/components/page-header';

const VALUES = [
  { title: 'about.value1Title', text: 'about.value1Text' },
  { title: 'about.value2Title', text: 'about.value2Text' },
  { title: 'about.value3Title', text: 'about.value3Text' },
] as const;

export function AboutPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('about.title')} lead={t('about.lead')} />
      <Container className="pt-section">
        <section className="max-w-prose">
          <h2 className="text-3xl">{t('about.storyTitle')}</h2>
          <p className="mt-4">{t('about.storyP1')}</p>
          <p className="mt-4">{t('about.storyP2')}</p>
        </section>

        <section className="pt-section">
          <h2 className="text-3xl">{t('about.valuesTitle')}</h2>
          <ul className="mt-8 grid gap-6 md:grid-cols-3">
            {VALUES.map((value) => (
              <li key={value.title} className={card}>
                <h3 className="text-xl">{t(value.title)}</h3>
                <p className="text-text-muted mt-2">{t(value.text)}</p>
              </li>
            ))}
          </ul>
        </section>

        <section className="pt-section max-w-prose">
          <h2 className="text-3xl">{t('about.teamTitle')}</h2>
          <p className="mt-4">{t('about.teamText')}</p>
        </section>
      </Container>
    </>
  );
}
