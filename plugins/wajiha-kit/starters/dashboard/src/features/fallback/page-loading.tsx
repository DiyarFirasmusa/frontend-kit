import { useTranslation } from 'react-i18next';
import { Skeleton } from '@/components/ui/skeleton';
import { cn } from '@/lib/utils';

interface PageLoadingProps {
  compact?: boolean;
  className?: string;
}

const KPI_SLOTS = [1, 2, 3, 4, 5, 6] as const;

export function PageLoading({ compact, className }: PageLoadingProps) {
  const { t } = useTranslation();
  if (compact) {
    return (
      <div
        role="status"
        aria-live="polite"
        aria-busy="true"
        className={cn('gap-field flex items-center px-4 py-3', className)}
      >
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-3 w-40" />
        <span className="sr-only">{t('common.loading')}</span>
      </div>
    );
  }

  return (
    <div
      role="status"
      aria-live="polite"
      aria-busy="true"
      className={cn('gap-card p-page flex flex-col', className)}
    >
      <div className="gap-field pb-card flex flex-col">
        <Skeleton className="h-3 w-24" />
        <Skeleton className="h-7 w-56" />
      </div>
      <div className="gap-field grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-6">
        {KPI_SLOTS.map((slot) => (
          <Skeleton key={`pl-kpi-${slot}`} className="h-24 w-full" />
        ))}
      </div>
      <div className="gap-card grid lg:grid-cols-3">
        <Skeleton className="h-72 w-full lg:col-span-2" />
        <Skeleton className="h-72 w-full" />
      </div>
      <span className="sr-only">{t('common.loading')}</span>
    </div>
  );
}
