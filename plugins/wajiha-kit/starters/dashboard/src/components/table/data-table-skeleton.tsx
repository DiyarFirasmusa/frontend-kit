import { Skeleton } from '@/components/ui/skeleton';
import { TableCell } from '@/components/ui/table';
import { cn } from '@/lib/utils';
import { ROW_HEIGHT_CLASS } from './data-table-row';

interface SkeletonColumn {
  id: string;
  cellClassName?: string;
}

interface DataTableSkeletonProps {
  columns: SkeletonColumn[];
  rows: number;
}

const BAR_WIDTHS = ['w-32', 'w-44', 'w-24', 'w-36', 'w-28', 'w-40'];

export function DataTableSkeleton({ columns, rows }: DataTableSkeletonProps) {
  return (
    <>
      {Array.from({ length: rows }, (_, i) => (
        <tr
          key={`skeleton-${i}`}
          className={cn(
            'border-stroke-subtle border-b last:border-0',
            ROW_HEIGHT_CLASS,
          )}
        >
          {columns.map((col, ci) => (
            <TableCell
              key={col.id}
              className={cn(ROW_HEIGHT_CLASS, 'px-4 py-2', col.cellClassName)}
            >
              {col.id === 'actions' ? (
                <Skeleton className="h-7 w-16 rounded-md" />
              ) : col.id.includes('status') ? (
                <Skeleton className="h-6 w-20 rounded-full" />
              ) : (
                <Skeleton
                  className={cn(
                    'h-3.5',
                    BAR_WIDTHS[(i + ci) % BAR_WIDTHS.length],
                  )}
                />
              )}
            </TableCell>
          ))}
        </tr>
      ))}
    </>
  );
}
