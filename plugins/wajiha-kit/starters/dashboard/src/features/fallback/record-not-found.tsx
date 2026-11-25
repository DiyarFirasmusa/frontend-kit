import { useTranslation } from 'react-i18next';
import { Home } from '@/lib/icons';
import { ErrorPage } from './error-page';

interface RecordNotFoundProps {
  /** Localized record type shown in the details table, e.g. "Warehouse". */
  recordType: string;
  /** The identifier that was requested; shown LTR and never resolved further. */
  requestedId: string;
  onBackToList: () => void;
  onHome: () => void;
}

/**
 * Inline 404 result (design frame 23.03) for a detail page whose record the
 * API answered 404 for. It gives no hint about records outside the user's
 * warehouse scope.
 */
export function RecordNotFound({
  recordType,
  requestedId,
  onBackToList,
  onHome,
}: RecordNotFoundProps) {
  const { t } = useTranslation();

  return (
    <ErrorPage
      kind="notFound"
      primary={{
        label: t('errorPages.states.notFound.backToList'),
        onClick: onBackToList,
        icon: null,
      }}
      secondary={{ label: t('nav.dashboard'), onClick: onHome, icon: Home }}
      detailsAction={{
        label: t('errorPages.states.notFound.backToList'),
        onClick: onBackToList,
      }}
      details={[
        { label: t('errorPages.states.notFound.kind'), value: recordType },
        {
          label: t('errorPages.states.notFound.requested'),
          value: requestedId,
          ltr: true,
        },
        {
          label: t('errorPages.states.notFound.scope'),
          value: t('errorPages.states.notFound.scopeValue'),
        },
        {
          label: t('errorPages.states.notFound.result'),
          value: t('errorPages.states.notFound.resultValue'),
        },
      ]}
    />
  );
}
