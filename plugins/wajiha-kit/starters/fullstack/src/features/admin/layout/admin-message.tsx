import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { buttonVariants } from '@/components/ui/button';
import { toLocale } from '@/shared/lib/i18n/languages';

/** A whole-page message inside the admin (no access, unknown page) with a way back to the overview. */
export function AdminMessage({ kind }: { kind: 'forbidden' | 'notFound' }) {
  const { t, i18n } = useTranslation();
  const locale = toLocale(i18n.language);
  return (
    <section className="surface-card gap-row flex max-w-xl flex-col items-start">
      <h1 className="page-title">
        {kind === 'forbidden' ? t('admin.forbiddenTitle') : t('admin.notFoundTitle')}
      </h1>
      <p className="text-b1 text-text-secondary">
        {kind === 'forbidden' ? t('admin.forbiddenText') : t('admin.notFoundText')}
      </p>
      <Link to="/$locale/admin" params={{ locale }} className={buttonVariants()}>
        {t('admin.backToOverview')}
      </Link>
    </section>
  );
}
