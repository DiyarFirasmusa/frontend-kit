import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import type { ErrorKind } from '@/api/error/utils/classify';
import { PageHeader } from '@/components/shared/page-header';
import { Button } from '@/components/ui/button';
import { directionOf } from '@/lib/i18n/languages';
import { Home, LogIn, RefreshCw, type IconComponent } from '@/lib/icons';
import { ErrorDetailsSection } from './error-details-section';

interface KindConfig {
  /** i18n key prefix holding code, title, subtitle, alert and tips copy. */
  prefix: string;
  tips: readonly string[];
}

/** Request-level failures plus the page-level 403 and 404 states. */
export type ErrorPageKind = ErrorKind | 'forbidden' | 'notFound';

export const ERROR_KIND: Record<ErrorPageKind, KindConfig> = {
  network: {
    prefix: 'errorPages.network',
    tips: ['tip1', 'tip2', 'tip3'],
  },
  server: {
    prefix: 'errorPages.server',
    tips: ['tip1', 'tip2'],
  },
  unexpected: {
    prefix: 'errorPages.unexpected',
    tips: ['tip1', 'tip2'],
  },
  forbidden: {
    prefix: 'errorPages.states.forbidden',
    tips: ['tip1'],
  },
  notFound: {
    prefix: 'errorPages.states.notFound',
    tips: ['tip1'],
  },
};

export interface ErrorDetail {
  label: string;
  value: ReactNode;
  mono?: boolean;
  ltr?: boolean;
}

export interface ErrorPageAction {
  label: string;
  onClick: () => void;
  /** Leading icon; each slot has a default, `null` hides it. */
  icon?: IconComponent | null;
}

export interface ErrorPageProps {
  kind: ErrorPageKind;
  /** Optional button under the details table (e.g. "Back to the list"). */
  detailsAction?: ErrorPageAction;
  /** Overrides the page title (defaults to the kind's title). */
  title?: string;
  primary: ErrorPageAction;
  secondary?: ErrorPageAction;
  extra?: ErrorPageAction;
  details?: ErrorDetail[];
  status?: ReactNode;
  standalone?: boolean;
}

/**
 * Full-page error in the dashboard's own layout (design frames 23.x): page
 * header with actions, a danger alert card, the error details and an amber
 * "what to do now" card. Inside the shell it replaces the page content; with
 * `standalone` it centres itself on the canvas for errors above the shell.
 */
export function ErrorPage({
  kind,
  primary,
  secondary,
  extra,
  details = [],
  status,
  standalone = false,
  detailsAction,
  title,
}: ErrorPageProps) {
  const { t, i18n } = useTranslation();
  const config = ERROR_KIND[kind];
  const key = (name: string) => `${config.prefix}.${name}`;
  // 403/404 explain the request in user terms; failed requests show
  // technical data that only support needs, so it starts collapsed.
  const isPageState = kind === 'forbidden' || kind === 'notFound';

  const content = (
    <section
      dir={directionOf(i18n.language)}
      aria-labelledby="error-page-title"
      className="gap-card animate-in fade-in slide-in-from-bottom-2 flex w-full flex-col duration-300"
    >
      <PageHeader
        title={title ?? t(key('title'))}
        subtitle={`${t(key('code'))} · ${t(key('subtitle'))}`}
        actions={
          <>
            {secondary ? (
              <ActionButton
                action={secondary}
                variant="outline"
                fallbackIcon={Home}
              />
            ) : null}
            {extra ? (
              <ActionButton
                action={extra}
                variant="outline"
                fallbackIcon={LogIn}
              />
            ) : null}
            <ActionButton
              action={primary}
              variant="default"
              fallbackIcon={RefreshCw}
            />
          </>
        }
      />

      <div
        role="alert"
        className="border-danger/60 gap-field p-card flex flex-col rounded-(--radius-modal) border"
      >
        <h2 id="error-page-title" className="text-h4 text-danger">
          {t(key('alertTitle'))}
        </h2>
        <p className="text-b2 text-text-secondary">
          {t(key('alertDescription'))}
        </p>
        {status ? <div className="pt-field">{status}</div> : null}
      </div>

      {details.length > 0 ? (
        <ErrorDetailsSection
          title={t(
            isPageState ? key('detailsTitle') : 'errorPages.details.title',
          )}
          details={details}
          collapsible={!isPageState}
          action={
            detailsAction ? (
              <ActionButton
                action={detailsAction}
                variant="outline"
                fallbackIcon={null}
              />
            ) : null
          }
        />
      ) : null}

      <section className="bg-brand-tint gap-field p-card flex flex-col rounded-(--radius-modal)">
        <h2 className="text-h4 text-brand-text">{t(key('tipsTitle'))}</h2>
        <ul className="gap-field text-b2 text-text-secondary flex flex-col">
          {config.tips.map((tip) => (
            <li key={tip}>{t(key(tip))}</li>
          ))}
        </ul>
      </section>
    </section>
  );

  if (!standalone) {
    return content;
  }
  return (
    <main className="bg-background md:p-page flex min-h-svh w-full justify-center p-4">
      <div className="flex w-full max-w-4xl flex-col justify-center">
        {content}
      </div>
    </main>
  );
}

function ActionButton({
  action,
  variant,
  fallbackIcon,
}: {
  action: ErrorPageAction;
  variant: 'default' | 'outline';
  fallbackIcon: IconComponent | null;
}) {
  const Icon = action.icon === undefined ? fallbackIcon : action.icon;
  return (
    <Button type="button" variant={variant} onClick={action.onClick}>
      {Icon ? <Icon className="size-4" /> : null}
      {action.label}
    </Button>
  );
}
