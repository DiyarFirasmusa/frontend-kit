import type { ReactNode } from 'react';
import { ChevronDown } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { ErrorDetail } from './error-page';

interface ErrorDetailsSectionProps {
  title: string;
  details: readonly ErrorDetail[];
  /** Starts closed behind its title: request data is for support, not for the reader. */
  collapsible: boolean;
  action?: ReactNode;
}

function renderDetailValue(detail: ErrorDetail): ReactNode {
  const empty =
    detail.value === null || detail.value === undefined || detail.value === '';
  if (empty) {
    return '—';
  }
  if (detail.mono || detail.ltr) {
    return (
      <span
        dir="ltr"
        className={detail.mono ? 'font-mono break-all' : undefined}
      >
        {detail.value}
      </span>
    );
  }
  return detail.value;
}

function DetailsTable({ details }: { details: readonly ErrorDetail[] }) {
  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-xl border-separate border-spacing-0 text-start">
        <thead>
          <tr>
            {details.map((detail, index) => (
              <th
                key={detail.label}
                scope="col"
                className={cn(
                  'bg-hover-row text-table-header text-text-muted h-11 px-3 text-start',
                  index === 0 && 'rounded-s-(--radius-control)',
                  index === details.length - 1 &&
                    'rounded-e-(--radius-control)',
                )}
              >
                {detail.label}
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          <tr>
            {details.map((detail) => (
              <td
                key={detail.label}
                className="border-stroke-subtle text-b2 text-text-primary h-16 border-b px-3"
              >
                {renderDetailValue(detail)}
              </td>
            ))}
          </tr>
        </tbody>
      </table>
    </div>
  );
}

/** The request details card of the error page, open or behind a disclosure. */
export function ErrorDetailsSection({
  title,
  details,
  collapsible,
  action,
}: ErrorDetailsSectionProps) {
  const heading = (
    <h2 id="error-page-details" className="text-h4 text-text-primary">
      {title}
    </h2>
  );
  const body = (
    <>
      <DetailsTable details={details} />
      {action ? <div>{action}</div> : null}
    </>
  );

  if (!collapsible) {
    return (
      <section
        aria-labelledby="error-page-details"
        className="surface-card gap-row flex flex-col"
      >
        {heading}
        {body}
      </section>
    );
  }
  return (
    <details className="surface-card group">
      <summary className="gap-field flex cursor-pointer list-none items-center rounded-(--radius-control) [&::-webkit-details-marker]:hidden">
        {heading}
        <ChevronDown
          aria-hidden
          className="text-text-secondary size-4 shrink-0 transition-transform group-open:rotate-180 motion-reduce:transition-none"
        />
      </summary>
      <div className="gap-row pt-row flex flex-col">{body}</div>
    </details>
  );
}
