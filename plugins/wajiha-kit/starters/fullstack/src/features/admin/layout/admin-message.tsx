import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { buttonVariants } from '@/components/ui/button';
import { toLocale } from '@/shared/lib/i18n/languages';

/**
 * A whole-page message inside the admin with a way back.
 *  - "forbidden": rendered inside the admin shell (the <main> is the shell's), text from the admin bundle.
 *  - "notFound": rendered ALONE, without the shell and before the admin bundle is guaranteed to be
 *    loaded (an unknown URL never runs the admin layout's beforeLoad), so it brings its own <main> and
 *    uses only the always-loaded texts (src/shared/locales, group "error").
 */
export function AdminMessage({ kind }: { kind: 'forbidden' | 'notFound' }) {
  const { t, i18n } = useTranslation();
  const locale = toLocale(i18n.language);
  const forbidden = kind === 'forbidden';
  const card = (
    <section className="surface-card gap-row flex max-w-xl flex-col items-start">
      <h1 className="page-title">
        {forbidden ? t('admin.forbiddenTitle') : t('error.notFoundTitle')}
      </h1>
      <p className="text-b1 text-text-secondary">
        {forbidden ? t('admin.forbiddenText') : t('error.notFoundText')}
      </p>
      <Link to="/$locale/admin" params={{ locale }} className={buttonVariants()}>
        {forbidden ? t('admin.backToOverview') : t('error.backToAdmin')}
      </Link>
    </section>
  );
  if (forbidden) {
    return card;
  }
  return (
    <main
      id="admin-main"
      tabIndex={-1}
      className="bg-background p-row grid min-h-dvh place-items-center"
    >
      {card}
    </main>
  );
}
