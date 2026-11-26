import type { ReactNode } from 'react';
import { useTranslation } from 'react-i18next';
import { TableCell } from '@/components/ui/table';
import { SearchX } from '@/lib/icons';
import { stateHeightClass, TABLE_HEADER_TINT } from './data-table-row';

interface DataTableEmptyProps {
  colSpan: number;
  rows?: number;
  label?: string;
  /** An action under the message: create (empty list) or clear filters (no results). */
  children?: ReactNode;
}

export function DataTableEmpty({
  colSpan,
  rows = 5,
  label,
  children,
}: DataTableEmptyProps) {
  const { t } = useTranslation();
  return (
    <tr>
      <TableCell
        colSpan={colSpan}
        className={`text-center ${stateHeightClass(rows)}`}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div
            className={`text-text-muted grid size-16 place-items-center rounded-2xl ${TABLE_HEADER_TINT}`}
          >
            <SearchX className="size-7" />
          </div>
          <p className="text-h4 text-text-secondary">
            {label ?? t('common.noResults')}
          </p>
          {children}
        </div>
      </TableCell>
    </tr>
  );
}
