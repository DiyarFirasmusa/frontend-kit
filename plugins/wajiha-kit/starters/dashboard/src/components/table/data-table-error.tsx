import { useTranslation } from 'react-i18next';
import { Button } from '@/components/ui/button';
import { TableCell } from '@/components/ui/table';
import { AlertCircle, RotateCw } from '@/lib/icons';
import { stateHeightClass } from './data-table-row';

interface DataTableErrorProps {
  colSpan: number;
  rows?: number;
  label?: string;
  onRetry?: () => void;
}

export function DataTableError({
  colSpan,
  rows = 5,
  label,
  onRetry,
}: DataTableErrorProps) {
  const { t } = useTranslation();
  return (
    <tr>
      <TableCell
        colSpan={colSpan}
        className={`text-center ${stateHeightClass(rows)}`}
      >
        <div className="flex flex-col items-center justify-center gap-4">
          <div className="bg-danger/10 text-danger grid size-16 place-items-center rounded-2xl">
            <AlertCircle className="size-7" />
          </div>
          <div className="space-y-1">
            <p className="text-h4 text-text-primary">{t('common.error')}</p>
            {label ? (
              <p className="text-b2 text-text-secondary">{label}</p>
            ) : null}
          </div>
          {onRetry ? (
            <Button variant="outline" className="gap-2" onClick={onRetry}>
              <RotateCw className="size-4" />
              {t('common.tryAgain')}
            </Button>
          ) : null}
        </div>
      </TableCell>
    </tr>
  );
}
