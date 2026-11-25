import { useTranslation } from 'react-i18next';
import { Button, buttonVariants } from '@/components/ui/button';
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from '@/components/ui/dropdown-menu';
import { ChevronDown, Loader2, Spreadsheet } from '@/lib/icons';

export interface ExportExcelButtonProps {
  /** Exports every row that matches the filters. */
  onExport: () => void;
  /** Exports only the rows on the current page. When set, the button opens a menu with both choices. */
  onExportPage?: () => void;
  isExporting?: boolean;
  disabled?: boolean;
  /** Defaults to «Export Excel». */
  label?: string;
}

export function ExportExcelButton({
  onExport,
  onExportPage,
  isExporting = false,
  disabled = false,
  label,
}: ExportExcelButtonProps) {
  const { t } = useTranslation();
  const icon = isExporting ? (
    <Loader2 className="size-4 animate-spin" />
  ) : (
    <Spreadsheet className="size-4" />
  );
  const text = isExporting
    ? t('common.exporting')
    : (label ?? t('common.exportExcel'));

  if (!onExportPage) {
    return (
      <Button
        type="button"
        variant="outline"
        disabled={disabled || isExporting}
        aria-busy={isExporting || undefined}
        onClick={() => {
          onExport();
        }}
      >
        {icon}
        {text}
      </Button>
    );
  }

  return (
    <DropdownMenu>
      <DropdownMenuTrigger
        disabled={disabled || isExporting}
        aria-busy={isExporting || undefined}
        className={buttonVariants({ variant: 'outline' })}
      >
        {icon}
        {text}
        <ChevronDown className="size-4" />
      </DropdownMenuTrigger>
      <DropdownMenuContent align="end" className="min-w-48">
        <DropdownMenuItem
          onClick={() => {
            onExportPage();
          }}
        >
          {t('common.exportCurrentPage')}
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            onExport();
          }}
        >
          {t('common.exportAllRows')}
        </DropdownMenuItem>
      </DropdownMenuContent>
    </DropdownMenu>
  );
}
