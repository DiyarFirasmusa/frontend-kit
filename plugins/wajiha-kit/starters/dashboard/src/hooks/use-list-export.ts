import { useExcelExport } from '@/hooks/use-excel-export';
import type { PageResponse } from '@/types/api/page';
import type { ExportColumn } from '@/types/export';

/** One request for the whole filtered set; the backend caps `size`. */
const EXPORT_PAGE_SIZE = 1000;

interface UseListExportOptions<
  P extends { page: number; pageSize: number },
  T,
> {
  fileName: string;
  sheetName: string;
  columns: ExportColumn<T>[];
  /** The list's current params: the export covers the filtered set, not the page on screen. */
  params: P;
  fetchAll: (params: P) => Promise<PageResponse<T>>;
  /** Total of the filtered list, to disable the button when it is empty. */
  total: number | undefined;
}

/** Excel export of a server-paged list: props for `<ExportExcelButton>`. */
export function useListExport<P extends { page: number; pageSize: number }, T>({
  fileName,
  sheetName,
  columns,
  params,
  fetchAll,
  total,
}: UseListExportOptions<P, T>) {
  const excel = useExcelExport({
    fileName,
    sheetName,
    columns,
    load: async () => {
      const all = await fetchAll({
        ...params,
        page: 1,
        pageSize: EXPORT_PAGE_SIZE,
      });
      return {
        rows: all.content,
        total: all.totalElements,
        isTruncated: all.totalElements > all.content.length,
      };
    },
  });
  return {
    onExport: excel.exportExcel,
    isExporting: excel.isExporting,
    disabled: (total ?? 0) === 0,
  };
}
