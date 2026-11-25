import { useMutation } from '@tanstack/react-query';
import { useTranslation } from 'react-i18next';
import { toast } from 'sonner';
import { directionOf } from '@/lib/i18n/languages';
import { resolveExportNames } from '@/services/export-names.service';
import type { ExportColumn, ExportRows } from '@/types/export';
import { saveBlob } from '@/utils/download-file';
import { collectPersonIds, toExportMatrix } from '@/utils/export-table';
import { localIsoDate } from '@/utils/format';

/** The backend's cap on one `all=true` response. */
export const EXPORT_ROW_LIMIT = 50_000;

export interface UseExcelExportOptions<T> {
  /** File name without the date or extension, e.g. `stock-documents`. */
  fileName: string;
  /** Sheet tab name (the page title). */
  sheetName: string;
  columns: ExportColumn<T>[];
  /** Rows to write: every row from the backend (`all=true`) or the rows already loaded. */
  load: () => Promise<ExportRows<T> | T[]> | T[];
  /** The rows on the current page. When set, the page can also export only these. */
  pageRows?: T[];
}

export type ExportScope = 'all' | 'page';

function toExportRows<T>(result: ExportRows<T> | T[]): ExportRows<T> {
  return Array.isArray(result)
    ? { rows: result, total: result.length, isTruncated: false }
    : result;
}

/**
 * Exports a list to Excel (.xlsx) with the on-screen column labels. Failed
 * requests are toasted by the api client; a cut result (over 50,000 rows)
 * still downloads and warns the user to narrow the filters.
 */
export function useExcelExport<T>({
  fileName,
  sheetName,
  columns,
  load,
  pageRows,
}: UseExcelExportOptions<T>) {
  const { t, i18n } = useTranslation();
  const mutation = useMutation({
    mutationFn: async (scope: ExportScope) => {
      const { rows, total, isTruncated } = toExportRows(
        scope === 'page' && pageRows ? pageRows : await load(),
      );
      const personIds = collectPersonIds(rows, columns);
      const names =
        personIds.size > 0 ? await resolveExportNames(personIds) : undefined;
      const { buildXlsx, xlsxFileName } = await import('@/utils/export-xlsx');
      const blob = await buildXlsx([
        {
          name: sheetName,
          headers: columns.map((column) => column.header),
          rows: toExportMatrix(rows, columns, names),
          rtl: directionOf(i18n.language) === 'rtl',
        },
      ]);
      saveBlob(blob, xlsxFileName(`${fileName}-${localIsoDate(new Date())}`));
      if (isTruncated) {
        toast.warning(
          t('common.exportTruncated', {
            limit: EXPORT_ROW_LIMIT.toLocaleString('en-US'),
            total: total.toLocaleString('en-US'),
          }),
        );
      }
    },
  });
  const { mutate, isPending } = mutation;
  return {
    exportExcel: () => {
      mutate('all');
    },
    exportPage: pageRows
      ? () => {
          mutate('page');
        }
      : undefined,
    isExporting: isPending,
  };
}
