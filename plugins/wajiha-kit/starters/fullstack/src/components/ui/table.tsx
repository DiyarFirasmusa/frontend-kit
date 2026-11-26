import * as React from 'react';
import { useTranslation } from 'react-i18next';
import { cn } from '@/shared/utils/cn';

function Table({ className, ...props }: React.ComponentProps<'table'>) {
  const { t } = useTranslation();
  return (
    <section
      data-slot="table-container"
      tabIndex={0}
      aria-label={props['aria-label'] ?? t('ui.scrollRegion')}
      className="custom-scrollbar focus-visible:ring-ring relative w-full overflow-x-auto rounded-[inherit] outline-none focus-visible:ring-2"
    >
      <table
        data-slot="table"
        className={cn('w-full caption-bottom text-b2', className)}
        {...props}
      />
    </section>
  );
}

function TableHeader({ className, ...props }: React.ComponentProps<'thead'>) {
  return (
    <thead
      data-slot="table-header"
      className={cn('[&_tr]:h-9 [&_tr]:border-b [&_tr]:border-(--stroke-subtle)', className)}
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
        'h-[62px] border-b border-(--stroke-subtle) transition-colors hover:bg-(--hover-row) has-aria-expanded:bg-(--hover-row) data-[state=selected]:bg-(--hover-row)',
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

function TableCaption({ className, ...props }: React.ComponentProps<'caption'>) {
  return (
    <caption
      data-slot="table-caption"
      className={cn('mt-4 text-b3 text-(--text-muted)', className)}
      {...props}
    />
  );
}

export { Table, TableHeader, TableBody, TableFooter, TableHead, TableRow, TableCell, TableCaption };
