import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { getErrorStatus, resolveApiErrorMessage } from '@/api/error/api-error';
import { Button } from '@/components/ui/button';
import { Skeleton } from '@/components/ui/skeleton';
import { AlertCircle, Info, RefreshCcw } from '@/lib/icons';
import { cn } from '@/lib/utils';

type EmptyTone = 'default' | 'onBrand';

interface WrapperProps<T> {
  isLoading?: boolean;
  isError?: boolean;
  error?: unknown;
  data?: T | null;
  isEmpty?: (data: T) => boolean;
  hideEmpty?: boolean;

  emptyMessage?: string;
  errorMessage?: string;
  onRetry?: () => void;

  emptyTone?: EmptyTone;
  className?: string;

  loadingFallback?: ReactNode;
  errorFallback?: ReactNode;
  emptyFallback?: ReactNode;

  children: ReactNode | ((data: T) => ReactNode);
}

function isFunction<T>(
  value: ReactNode | ((data: T) => ReactNode),
): value is (data: T) => ReactNode {
  return typeof value === 'function';
}

function EmptyView({
  title,
  message,
  onBrand,
}: {
  title: string;
  message?: string;
  onBrand: boolean;
}) {
  return (
    <div
      className={cn(
        'flex flex-col items-center justify-center text-center',
        onBrand ? 'py-12' : 'py-16',
      )}
      data-slot="wrapper-empty"
      role="status"
      aria-live="polite"
    >
      <div
        className={cn(
          'mb-card grid size-16 place-items-center rounded-(--radius-kpi) border',
          onBrand
            ? 'border-white/25 bg-white/10 text-white'
            : 'border-stroke bg-surface-dim text-text-secondary',
        )}
      >
        <Info className="size-8" />
      </div>
      <div className="max-w-sm space-y-2">
        <h2
          className={cn(
            'text-h4',
            onBrand ? 'text-white' : 'text-text-primary',
          )}
        >
          {title}
        </h2>
        {message ? (
          <p
            className={cn(
              'text-b2',
              onBrand ? 'text-white/80' : 'text-text-secondary',
            )}
          >
            {message}
          </p>
        ) : null}
      </div>
    </div>
  );
}

function defaultIsEmpty<T>(data: T | null | undefined): boolean {
  if (data === null || data === undefined) {
    return true;
  }
  if (Array.isArray(data)) {
    return data.length === 0;
  }
  return false;
}

const SKELETON_SECTION_FIELDS = [4, 4, 3] as const;

/** Loading placeholder shaped like a detail page: status chips above a stack
 *  of section cards, each a header row plus a grid of label/value pairs. */
function DetailSkeleton() {
  return (
    <div data-slot="detail-skeleton" aria-hidden className="space-y-card">
      <div className="flex flex-wrap items-center gap-2">
        <Skeleton className="h-6 w-24 rounded-full" />
        <Skeleton className="h-6 w-20 rounded-full" />
      </div>
      {SKELETON_SECTION_FIELDS.map((fields, index) => (
        <div key={index} className="surface-card">
          <div className="mb-card gap-inline flex items-center">
            <Skeleton className="size-9 rounded-lg" />
            <Skeleton className="h-5 w-40" />
          </div>
          <div className="gap-row grid sm:grid-cols-2 lg:grid-cols-4">
            {Array.from({ length: fields }, (_, field) => (
              <div key={field} className="gap-field flex flex-col">
                <Skeleton className="h-4 w-24" />
                <Skeleton className="h-5 w-40" />
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
}

export function Wrapper<T>({
  isLoading,
  isError,
  error,
  data,
  isEmpty,
  hideEmpty,
  emptyMessage,
  errorMessage,
  onRetry,
  emptyTone = 'default',
  className,
  loadingFallback,
  errorFallback,
  emptyFallback,
  children,
}: WrapperProps<T>) {
  const { t } = useTranslation();
  const hasError = isError ?? !!error;

  if (isLoading) {
    if (loadingFallback !== undefined) {
      return <>{loadingFallback}</>;
    }
    return (
      <div
        data-slot="wrapper-loading"
        role="status"
        aria-busy="true"
        aria-live="polite"
      >
        <span className="sr-only">{t('common.loading')}</span>
        <DetailSkeleton />
      </div>
    );
  }

  if (hasError) {
    if (errorFallback !== undefined) {
      return <>{errorFallback}</>;
    }
    const msg =
      errorMessage ?? resolveApiErrorMessage(error, t('common.error'));

    const status = getErrorStatus(error);
    if (status === 404) {
      return (
        <EmptyView
          title={t('common.noData')}
          message={msg}
          onBrand={emptyTone === 'onBrand'}
        />
      );
    }

    return (
      <div
        className="flex flex-col items-center justify-center py-16 text-center"
        data-slot="wrapper-error"
        role="alert"
      >
        <div className="border-stroke bg-surface space-y-card max-w-md rounded-(--radius-modal) border p-8">
          <div className="bg-danger/10 text-danger mx-auto grid size-14 place-items-center rounded-(--radius-kpi)">
            <AlertCircle className="size-7" />
          </div>
          <div className="space-y-field">
            <h2 className="text-h3 text-text-primary">{t('common.error')}</h2>
            <p className="text-b2 text-text-secondary">{msg}</p>
          </div>
          {onRetry ? (
            <Button
              variant="outline"
              onClick={() => {
                onRetry();
              }}
              className="mx-auto"
            >
              <RefreshCcw className="size-4" /> {t('common.tryAgain')}
            </Button>
          ) : null}
        </div>
      </div>
    );
  }

  const emptyCheck = isEmpty ?? defaultIsEmpty;
  const empty = data === null || data === undefined || emptyCheck(data as T);

  if (empty) {
    if (hideEmpty) {
      return isFunction<T>(children) ? null : <>{children}</>;
    }
    if (emptyFallback !== undefined) {
      return <>{emptyFallback}</>;
    }
    return (
      <EmptyView
        title={t('common.noData')}
        message={emptyMessage}
        onBrand={emptyTone === 'onBrand'}
      />
    );
  }

  const content = isFunction<T>(children) ? children(data as T) : children;
  return className ? (
    <div className={className}>{content}</div>
  ) : (
    <>{content}</>
  );
}
