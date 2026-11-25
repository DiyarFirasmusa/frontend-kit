import { Link } from '@tanstack/react-router';
import { type ReactNode, useId } from 'react';
import { useTranslation } from 'react-i18next';
import { directionOf } from '@/lib/i18n/languages';
import { ArrowRightLong } from '@/lib/icons';
import { cn } from '@/lib/utils';
import type { HomeLink } from '../types/types';

export interface HomePanelFrameProps {
  title: string;
  subtitle?: string;
  /** Optional link to the full list; leave it out when the panel has no page of its own. */
  viewAll?: { label: string; link: HomeLink };
  /** Extra content under the link on the end side (e.g. a chart legend). */
  aside?: ReactNode;
  /** Forces the panel layout direction (the movement chart is laid out LTR in both languages). */
  layoutDir?: 'ltr' | 'rtl';
  className?: string;
  children: ReactNode;
}

export function HomePanelFrame({
  title,
  subtitle,
  viewAll,
  aside,
  layoutDir,
  className,
  children,
}: HomePanelFrameProps) {
  const { i18n } = useTranslation();
  const titleId = useId();
  return (
    <section
      dir={layoutDir}
      aria-labelledby={titleId}
      className={cn('surface-card gap-row flex min-w-0 flex-col', className)}
    >
      <header className="gap-row flex flex-wrap items-start justify-between">
        <div
          dir={layoutDir ? directionOf(i18n.language) : undefined}
          className="flex min-w-0 flex-col gap-1"
        >
          <h2 id={titleId} className="text-h4 text-text-primary">
            {title}
          </h2>
          {subtitle ? (
            <p className="text-b3 text-text-secondary">{subtitle}</p>
          ) : null}
        </div>
        <div className="gap-field flex flex-col items-end">
          {viewAll ? (
            <Link
              {...viewAll.link}
              className="text-label text-text-secondary hover:text-text-primary inline-flex items-center gap-1 transition-colors"
            >
              {viewAll.label}
              <ArrowRightLong className="size-3.5 rtl:rotate-180" aria-hidden />
            </Link>
          ) : null}
          {aside}
        </div>
      </header>
      {children}
    </section>
  );
}
