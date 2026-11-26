import { Link } from '@tanstack/react-router';
import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { Ban, Building2, CircleCheckIcon } from '@/components/ui/icons';
import { Skeleton } from '@/components/ui/skeleton';
import { toLocale } from '@/shared/lib/i18n/languages';
import { formatCount, formatShortDate } from '../lib/format';
import { useAuthStore } from '../store/auth-store';
import { StatCard } from './stat-card';
import { useOverview } from './use-overview';

export function OverviewPage() {
  const { t, i18n } = useTranslation();
  const locale = toLocale(i18n.language);
  const user = useAuthStore((state) => state.user);
  const overview = useOverview();
  const data = overview.data;

  return (
    <section className="gap-card flex flex-col">
      <header>
        <h1 className="page-title">{t('overview.title')}</h1>
        <p className="page-subtitle">{t('overview.greeting', { name: user?.name ?? '' })}</p>
      </header>

      {overview.isError ? (
        <div role="alert" className="card p-card gap-row flex flex-col items-start">
          <p className="text-b1">{t('overview.loadError')}</p>
          <Button
            variant="outline"
            onClick={() => {
              void overview.refetch();
            }}
          >
            {t('ui.tryAgain')}
          </Button>
        </div>
      ) : null}

      <div className="gap-row grid sm:grid-cols-3" aria-busy={overview.isLoading}>
        {data === undefined ? (
          <>
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
            <Skeleton className="h-24" />
          </>
        ) : (
          <>
            <StatCard
              label={t('overview.totalSuppliers')}
              value={formatCount(data.suppliers.total, locale)}
              icon={Building2}
            />
            <StatCard
              label={t('overview.activeSuppliers')}
              value={formatCount(data.suppliers.active, locale)}
              icon={CircleCheckIcon}
              tone="success"
            />
            <StatCard
              label={t('overview.inactiveSuppliers')}
              value={formatCount(data.suppliers.inactive, locale)}
              icon={Ban}
              tone="warning"
            />
          </>
        )}
      </div>

      <section className="card p-card gap-row flex flex-col" aria-labelledby="recent-title">
        <div className="gap-field flex flex-wrap items-center justify-between">
          <h2 id="recent-title" className="text-h3">
            {t('overview.recentTitle')}
          </h2>
          <Link
            to="/$locale/admin/suppliers"
            params={{ locale }}
            className="text-b2 text-primary-text font-semibold underline underline-offset-4"
          >
            {t('overview.viewAll')}
          </Link>
        </div>
        {data === undefined ? (
          <Skeleton className="h-40" />
        ) : data.recentlyUpdated.length === 0 ? (
          <p className="text-b2 text-text-secondary">{t('overview.recentEmpty')}</p>
        ) : (
          <ul className="divide-stroke flex flex-col divide-y">
            {data.recentlyUpdated.map((supplier) => (
              <li
                key={supplier.id}
                className="gap-inline py-inline flex items-center justify-between"
              >
                <span className="flex min-w-0 flex-col">
                  <span className="text-b1 text-text-primary truncate font-semibold">
                    {supplier.name}
                  </span>
                  <span className="text-b3 text-text-muted" dir="ltr">
                    {supplier.code}
                  </span>
                </span>
                <span className="text-b3 text-text-secondary shrink-0">
                  {formatShortDate(supplier.updatedAt, locale)}
                </span>
              </li>
            ))}
          </ul>
        )}
      </section>
    </section>
  );
}
