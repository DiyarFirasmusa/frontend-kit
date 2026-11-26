import { useTranslation } from 'react-i18next';
import { card } from '@/components/common/button-styles';
import { Container } from '@/components/common/container';
import { SITE } from '@/config/site.config';
import { PageHeader } from '@/features/site/components/page-header';
import { ContactForm } from './components/contact-form';
import { submitContact } from './server/submit-contact';

export function ContactPage() {
  const { t } = useTranslation();
  return (
    <>
      <PageHeader title={t('contact.title')} lead={t('contact.lead')} />
      <Container className="pt-section grid gap-10 lg:grid-cols-[2fr_1fr]">
        <ContactForm submit={(data) => submitContact({ data })} />
        <aside className={`${card} self-start`} aria-labelledby="contact-details">
          <h2 id="contact-details" className="text-xl">
            {t('contact.detailsTitle')}
          </h2>
          <dl className="mt-4 space-y-4">
            <div>
              <dt className="font-semibold">{t('contact.emailTitle')}</dt>
              <dd className="text-text-muted">
                <a href={`mailto:${SITE.email}`} className="underline underline-offset-4">
                  {SITE.email}
                </a>
              </dd>
            </div>
            <div>
              <dt className="font-semibold">{t('contact.phoneTitle')}</dt>
              <dd dir="ltr" className="text-text-muted text-start">
                {SITE.phone}
              </dd>
            </div>
            <div>
              <dt className="font-semibold">{t('contact.addressTitle')}</dt>
              <dd className="text-text-muted">{t('footer.address')}</dd>
            </div>
            <div>
              <dt className="font-semibold">{t('contact.hoursTitle')}</dt>
              <dd className="text-text-muted">{t('contact.hoursText')}</dd>
            </div>
          </dl>
        </aside>
      </Container>
    </>
  );
}
