import type { useTranslation as useTranslationType } from 'react-i18next';
import type { ErrorKind } from '@/api/error/utils/classify';
import { formatDateTime } from '@/utils/format';
import type { ErrorDetail } from '../error-page';

type TFn = ReturnType<typeof useTranslationType>['t'];

export interface ErrorDetailsInput {
  kind: ErrorKind;
  page: string;
  occurredAt: string;
  status?: number | null;
  method?: string;
  path?: string;
  correlationId?: string | null;
}

/** Rows for the error details card; '—' stands in for anything unknown. */
export function buildErrorDetails(
  t: TFn,
  input: ErrorDetailsInput,
): ErrorDetail[] {
  const request =
    input.method && input.path ? `${input.method} ${input.path}` : null;
  return [
    {
      label: t('errorPages.details.code'),
      value: t(`errorPages.${input.kind}.code`),
    },
    {
      label: t('errorPages.details.status'),
      value: input.status ?? null,
      mono: true,
    },
    { label: t('errorPages.details.request'), value: request, mono: true },
    {
      label: t('errorPages.details.reference'),
      value: input.correlationId ?? null,
      mono: true,
    },
    {
      label: t('errorPages.details.time'),
      value: formatDateTime(input.occurredAt),
      ltr: true,
    },
    { label: t('errorPages.details.page'), value: input.page, mono: true },
  ];
}
