import type { ReactNode } from 'react';
import { cx } from '@/shared/utils/cx';

type ContainerProps = {
  children: ReactNode;
  className?: string;
  /** "prose" is the narrow reading column used by articles. */
  size?: 'page' | 'prose';
  role?: string;
};

export function Container({ children, className, size = 'page', role }: ContainerProps) {
  return (
    <div
      role={role}
      className={cx(
        'mx-auto w-full px-gutter',
        size === 'prose' ? 'max-w-prose' : 'max-w-page',
        className,
      )}
    >
      {children}
    </div>
  );
}
