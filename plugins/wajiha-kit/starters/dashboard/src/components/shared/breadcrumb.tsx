import { createLink } from '@tanstack/react-router';
import {
  Children,
  type ComponentPropsWithoutRef,
  isValidElement,
  type ReactNode,
} from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

function BreadcrumbAnchor({
  className,
  ...props
}: ComponentPropsWithoutRef<'a'>) {
  return (
    <a
      className={cn('hover:text-primary-text transition-colors', className)}
      {...props}
    />
  );
}

export const BreadcrumbLink = createLink(BreadcrumbAnchor);

export function BreadcrumbButton({
  className,
  ...props
}: ComponentPropsWithoutRef<'button'>) {
  return (
    <button
      type="button"
      className={cn('hover:text-primary-text transition-colors', className)}
      {...props}
    />
  );
}

interface BreadcrumbProps {
  /** Ancestor trail, in order, as `<BreadcrumbLink>` elements. */
  children?: ReactNode;
  current: string;
}

export function Breadcrumb({ children, current }: BreadcrumbProps) {
  const { t } = useTranslation();

  return (
    <nav
      aria-label={t('common.breadcrumb')}
      className="text-brand-text text-b3 flex flex-wrap items-center"
    >
      <ol className="gap-x-field flex flex-wrap items-center">
        {Children.toArray(children).map((ancestor, index) => (
          <li
            key={
              isValidElement(ancestor) && ancestor.key !== null
                ? ancestor.key
                : index
            }
            className="gap-field inline-flex items-center"
          >
            {ancestor}
            <span aria-hidden>/</span>
          </li>
        ))}
        <li aria-current="page" className="font-medium">
          {current}
        </li>
      </ol>
    </nav>
  );
}
