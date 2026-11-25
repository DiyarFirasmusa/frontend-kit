import { useTranslation } from 'react-i18next';
import { buttonPrimary, buttonSecondary } from '@/shared/components/button-styles';
import { cx } from '@/shared/utils/cx';
import { useContactForm } from '../hooks/use-contact-form';
import type { ContactInput } from '../validations/contact-schema';

type Props = {
  submit: (input: ContactInput) => Promise<{ ok: boolean }>;
};

const inputClass =
  'mt-1 block min-h-11 w-full rounded-md border border-input-border bg-surface px-3 py-2 text-base text-text aria-[invalid=true]:border-danger';

export function ContactForm({ submit }: Props) {
  const { t } = useTranslation();
  const { form, status, onSubmit, reset } = useContactForm(submit);
  const {
    register,
    formState: { errors, isSubmitting },
  } = form;

  if (status === 'sent') {
    return (
      <output className="border-border bg-surface block rounded-lg border p-6">
        <h2 className="text-success text-2xl">{t('contact.successTitle')}</h2>
        <p className="text-muted mt-2">{t('contact.successText')}</p>
        <button type="button" onClick={reset} className={cx(buttonSecondary, 'mt-6')}>
          {t('contact.sendAnother')}
        </button>
      </output>
    );
  }

  const fieldError = (message: string | undefined, id: string) =>
    message === undefined ? null : (
      <p id={id} role="alert" className="text-danger mt-1 text-sm">
        {t(message)}
      </p>
    );

  return (
    <form
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-describedby="contact-form-error"
    >
      <div>
        <label htmlFor="contact-name" className="font-semibold">
          {t('contact.nameLabel')}
        </label>
        <input
          id="contact-name"
          type="text"
          autoComplete="name"
          className={inputClass}
          aria-invalid={errors.name !== undefined}
          aria-describedby={errors.name === undefined ? undefined : 'contact-name-error'}
          {...register('name')}
        />
        {fieldError(errors.name?.message, 'contact-name-error')}
      </div>

      <div>
        <label htmlFor="contact-email" className="font-semibold">
          {t('contact.emailLabel')}
        </label>
        <input
          id="contact-email"
          type="email"
          dir="ltr"
          autoComplete="email"
          inputMode="email"
          className={cx(inputClass, 'text-start')}
          aria-invalid={errors.email !== undefined}
          aria-describedby={errors.email === undefined ? undefined : 'contact-email-error'}
          {...register('email')}
        />
        {fieldError(errors.email?.message, 'contact-email-error')}
      </div>

      <div>
        <label htmlFor="contact-phone" className="font-semibold">
          {t('contact.phoneLabel')}
        </label>
        <input
          id="contact-phone"
          type="tel"
          dir="ltr"
          autoComplete="tel"
          inputMode="tel"
          className={cx(inputClass, 'text-start')}
          aria-invalid={errors.phone !== undefined}
          aria-describedby={errors.phone === undefined ? undefined : 'contact-phone-error'}
          {...register('phone')}
        />
        {fieldError(errors.phone?.message, 'contact-phone-error')}
      </div>

      <div>
        <label htmlFor="contact-message" className="font-semibold">
          {t('contact.messageLabel')}
        </label>
        <textarea
          id="contact-message"
          rows={6}
          className={inputClass}
          aria-invalid={errors.message !== undefined}
          aria-describedby={errors.message === undefined ? undefined : 'contact-message-error'}
          {...register('message')}
        />
        {fieldError(errors.message?.message, 'contact-message-error')}
      </div>

      {/* Honeypot: off-screen, skipped by keyboards and screen readers; simple bots fill it in. */}
      <div aria-hidden="true" className="absolute start-[-9999px] h-px w-px overflow-hidden">
        <label htmlFor="contact-website">{t('contact.honeypotLabel')}</label>
        <input
          id="contact-website"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          {...register('website')}
        />
      </div>

      <p id="contact-form-error" role="alert" className="text-danger min-h-6">
        {status === 'failed' ? t('contact.serverError') : ''}
      </p>

      <button type="submit" disabled={isSubmitting} className={buttonPrimary}>
        {isSubmitting ? t('contact.sending') : t('contact.submit')}
      </button>
    </form>
  );
}
