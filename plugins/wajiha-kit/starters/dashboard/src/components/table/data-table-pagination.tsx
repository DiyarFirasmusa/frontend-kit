import { useMemo } from 'react';
import { useTranslation } from 'react-i18next';
import { ChevronLeft, ChevronRight } from '@/lib/icons';
import { cn } from '@/lib/utils';

/* Layout and states come from `.pagination` / `.page-box` (src/style/pagination.css). */

function getPageItems(current: number, total: number): (number | 'ellipsis')[] {
  if (total <= 7) {
    return Array.from({ length: total }, (_, i) => i);
  }
  const items: (number | 'ellipsis')[] = [0];
  const start = Math.max(1, current - 1);
  const end = Math.min(total - 2, current + 1);
  if (start > 1) {
    items.push('ellipsis');
  }
  for (let i = start; i <= end; i++) {
    items.push(i);
  }
  if (end < total - 2) {
    items.push('ellipsis');
  }
  items.push(total - 1);
  return items;
}

interface DataTablePaginationProps {
  page: number;
  totalPages: number;
  total: number;
  pageSize: number;
  onPageChange: (p: number) => void;
}

export function DataTablePagination({
  page,
  totalPages,
  total,
  pageSize,
  onPageChange,
}: DataTablePaginationProps) {
  const { t } = useTranslation();
  const from = total === 0 ? 0 : page * pageSize + 1;
  const to = Math.min(total, (page + 1) * pageSize);
  const items = useMemo(
    () => getPageItems(page, totalPages),
    [page, totalPages],
  );

  return (
    <nav className="pagination" aria-label={t('common.page')}>
      <p className="pagination-summary">
        {t('common.showing')}{' '}
        <span className="text-text-primary font-medium tabular-nums">
          {from}–{to}
        </span>{' '}
        {t('common.of')}{' '}
        <span className="text-text-primary font-medium tabular-nums">
          {total}
        </span>
      </p>

      <div className="pagination-list">
        <button
          type="button"
          className="page-box page-arrow"
          disabled={page === 0}
          onClick={() => {
            onPageChange(page - 1);
          }}
          aria-label={t('common.previous')}
        >
          <ChevronLeft className="rtl:rotate-180" />
        </button>

        {items.map((it, idx) =>
          it === 'ellipsis' ? (
            <span
              key={`ellipsis-${idx}`}
              className="page-box page-ellipsis"
              aria-hidden
            >
              …
            </span>
          ) : (
            <button
              key={it}
              type="button"
              className={cn('page-box tabular-nums')}
              aria-current={it === page ? 'page' : undefined}
              onClick={() => {
                onPageChange(it);
              }}
            >
              {it + 1}
            </button>
          ),
        )}

        <button
          type="button"
          className="page-box page-arrow"
          disabled={page >= totalPages - 1}
          onClick={() => {
            onPageChange(page + 1);
          }}
          aria-label={t('common.next')}
        >
          <ChevronRight className="rtl:rotate-180" />
        </button>
      </div>
    </nav>
  );
}
