import { useEffect, useRef } from 'react';
import { useTranslation } from 'react-i18next';
import { buttonPrimary, buttonSecondary } from '@/components/common/button-styles';
import { cx } from '@/shared/utils/cx';
import { useHydrated } from '@/shared/utils/use-hydrated';
import { useContactForm } from '../hooks/use-contact-form';
import type { ContactInput } from '../validations/contact-schema';

type Props = {
  submit: (input: ContactInput) => Promise<{ ok: boolean }>;
};

const inputClass =
  'mt-1 block min-h-11 w-full rounded-md border border-stroke-control bg-surface px-3 py-2 text-base text-text-primary aria-[invalid=true]:border-danger';

export function ContactForm({ submit }: Props) {
  const { t } = useTranslation();
  const { form, status, onSubmit, reset } = useContactForm(submit);
  const {
    register,
    setFocus,
    formState: { errors, isSubmitting },
  } = form;
  // Until React is running, a tap on Send would do a plain browser submit and lose the message.
  const hydrated = useHydrated();
  const successHeading = useRef<HTMLHeadingElement>(null);
  const previous = useRef(status);

  // Keyboard and screen reader users land on what changed: the success heading after sending, the first
  // field after "send another". The form unmounts on success, so focus would otherwise drop to <body>.
  useEffect(() => {
    if (status === 'sent') {
      successHeading.current?.focus();
    } else if (status === 'idle' && previous.current === 'sent') {
      setFocus('name');
    }
    previous.current = status;
  }, [status, setFocus]);

  if (status === 'sent') {
    return (
      <output className="border-stroke bg-surface block rounded-lg border p-6">
        <h2 ref={successHeading} tabIndex={-1} className="text-success text-2xl">
          {t('contact.successTitle')}
        </h2>
        <p className="text-text-muted mt-2">{t('contact.successText')}</p>
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
    // method="post": if the script has not run yet, the browser must never put the message in the URL.
    <form
      method="post"
      onSubmit={onSubmit}
      noValidate
      className="space-y-5"
      aria-label={t('contact.formLabel')}
      aria-describedby={status === 'failed' ? 'contact-form-error' : undefined}
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
        <label htmlFor="contact-ref">{t('contact.honeypotLabel')}</label>
        <input
          id="contact-ref"
          type="text"
          tabIndex={-1}
          autoComplete="off"
          data-lpignore="true"
          data-1p-ignore="true"
          data-bwignore="true"
          data-form-type="other"
          {...register('contactRef')}
        />
      </div>

      <p id="contact-form-error" role="alert" className="text-danger min-h-6">
        {status === 'failed' ? t('contact.serverError') : ''}
      </p>

      <button type="submit" disabled={!hydrated || isSubmitting} className={buttonPrimary}>
        {isSubmitting ? t('contact.sending') : t('contact.submit')}
      </button>
    </form>
  );
}
