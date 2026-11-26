import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/lib/utils';

/** True while `element` is wider inside than it is on screen. */
function useScrollsInline(ref: React.RefObject<HTMLElement | null>): boolean {
  const [scrolls, setScrolls] = React.useState(false);
  React.useEffect(() => {
    const element = ref.current;
    if (!element) {
      return;
    }
    const check = () => {
      setScrolls(element.scrollWidth > element.clientWidth + 1);
    };
    check();
    const observer = new ResizeObserver(check);
    observer.observe(element);
    if (element.firstElementChild) {
      observer.observe(element.firstElementChild);
    }
    return () => {
      observer.disconnect();
    };
  }, [ref]);
  return scrolls;
}

/**
 * The wrapper becomes a named, focusable region only while the table scrolls
 * sideways, so keyboard users can scroll it without a useless tab stop on
 * every table. The label names the region then, the table otherwise: never
 * both, or a screen reader reads it twice.
 */
function Table({
  className,
  'aria-label': ariaLabel,
  ...props
}: React.ComponentProps<'table'>) {
  const { t } = useTranslation();
  const containerRef = React.useRef<HTMLDivElement>(null);
  const scrolls = useScrollsInline(containerRef);
  return (
    <div
      ref={containerRef}
      data-slot="table-container"
      role={scrolls ? 'region' : undefined}
      tabIndex={scrolls ? 0 : undefined}
      aria-label={scrolls ? (ariaLabel ?? t('table.scrollRegion')) : undefined}
      className="custom-scrollbar focus-visible:outline-primary-highlight relative w-full overflow-x-auto rounded-[inherit] focus-visible:outline-2 focus-visible:-outline-offset-2"
    >
      <table
        data-slot="table"
        aria-label={scrolls ? undefined : ariaLabel}
        className={cn('w-full caption-bottom text-b2', className)}
        {...props}
      />
    </div>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn(
        '[&_tr]:h-9 [&_tr]:border-b [&_tr]:border-(--stroke-subtle)',
        className,
      )}
      {...props}
    />
  );
}

function TableBody({ className, ...props }: React.ComponentProps<'tbody'>) {
  return (
    <tbody
      data-slot="table-body"
      className={cn('[&_tr:last-child]:border-0', className)}
      {...props}
    />
  );
}

function TableFooter({ className, ...props }: React.ComponentProps<'tfoot'>) {
  return (
    <tfoot
      data-slot="table-footer"
      className={cn(
        'border-t border-(--stroke-subtle) bg-(--surface-dim) font-medium [&>tr]:last:border-b-0',
        className,
      )}
      {...props}
    />
  );
}

function TableRow({ className, ...props }: React.ComponentProps<'tr'>) {
  return (
    <tr
      data-slot="table-row"
      className={cn(
        'h-(--row-h) border-b border-(--stroke-subtle) transition-colors hover:bg-(--hover-row) has-aria-expanded:bg-(--hover-row) data-[state=selected]:bg-(--hover-row)',
        className,
      )}
      {...props}
    />
  );
}

function TableHead({ className, ...props }: React.ComponentProps<'th'>) {
  return (
    <th
      data-slot="table-head"
      className={cn(
        'h-9 px-3 text-start align-middle text-table-header font-normal whitespace-nowrap text-(--text-muted) [&:has([role=checkbox])]:pe-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCell({ className, ...props }: React.ComponentProps<'td'>) {
  return (
    <td
      data-slot="table-cell"
      className={cn(
        'px-3 py-2 align-middle text-b2 text-(--text-primary) whitespace-nowrap [&:has([role=checkbox])]:pe-0',
        className,
      )}
      {...props}
    />
  );
}

function TableCaption({
  className,
  ...props
}: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-b3 text-(--text-muted)', className)}
      {...props}
    />
  );
}

export {
  Table,
  TableHeader,
  TableBody,
  TableFooter,
  TableHead,
  TableRow,
  TableCell,
  TableCaption,
};
