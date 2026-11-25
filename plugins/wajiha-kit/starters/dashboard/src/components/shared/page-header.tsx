import type { ReactNode } from 'react';

interface PageHeaderProps {
  title: string;
  subtitle?: string;
  /** Status chip shown beside the title (e.g. a transit warehouse). */
  badge?: ReactNode;
  /** Breadcrumb trail rendered above the title, e.g. `<Breadcrumb>`. */
  breadcrumb?: ReactNode;
  actions?: ReactNode;
}

export function PageHeader({
  title,
  subtitle,
  badge,
  breadcrumb,
  actions,
}: PageHeaderProps) {
  return (
    <header className="gap-card flex flex-wrap items-center justify-between">
      <div className="flex min-w-0 flex-col gap-1">
        {breadcrumb}
        {badge ? (
          <div className="gap-inline flex flex-wrap items-center">
            <h1 className="text-text-primary text-h1">{title}</h1>
            {badge}
          </div>
        ) : (
          <h1 className="text-text-primary text-h1">{title}</h1>
        )}
        {subtitle ? (
          <p className="text-text-secondary text-b2">{subtitle}</p>
        ) : null}
      </div>
      {actions ? (
        <div className="gap-inline flex min-w-0 flex-wrap items-center">
          {actions}
        </div>
      ) : null}
    </header>
  );
}
