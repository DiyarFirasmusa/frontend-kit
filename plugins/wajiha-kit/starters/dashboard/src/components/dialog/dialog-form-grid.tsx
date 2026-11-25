import type { ReactNode } from 'react';
import { cn } from '@/lib/utils';

export interface DialogFormGridProps {
  children: ReactNode;
  className?: string;
}

export function DialogFormGrid({ children, className }: DialogFormGridProps) {
  return (
    <div className={cn('gap-row grid grid-cols-1 sm:grid-cols-2', className)}>
      {children}
    </div>
  );
}

export interface DialogFormFullWidthProps {
  children: ReactNode;
  className?: string;
}

export function DialogFormFullWidth({
  children,
  className,
}: DialogFormFullWidthProps) {
  return <div className={cn('col-span-full', className)}>{children}</div>;
}
