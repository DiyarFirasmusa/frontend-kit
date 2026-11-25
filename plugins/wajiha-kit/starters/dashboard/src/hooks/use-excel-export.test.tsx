import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { createHookWrapper } from '@/test/hook-wrapper';
import { setTestLanguage, tt } from '@/test/i18n';
import { serveDirectoryNames } from '@/test/msw/directory';
import {
  readXlsxRows,
  readXlsxSheetNames,
  recordDownloads,
  unzipText,
} from '@/test/xlsx';
import type { ExportColumn, ExportRows } from '@/types/export';
import { useExcelExport } from './use-excel-export';

interface Row {
  code: string;
  qty: number;
  createdBy: string | null;
}

const USER = '6f1d2c3a-0000-4000-8000-000000000001';

const columns: ExportColumn<Row>[] = [
  { header: 'Code', value: (row) => row.code },
  { header: 'Qty', value: (row) => row.qty },
  { header: 'By', value: (row) => row.createdBy, person: 'user' },
];

function renderExport(
  load: () => Promise<ExportRows<Row> | Row[]> | Row[],
  pageRows?: Row[],
) {
  const { wrapper } = createHookWrapper();
  return renderHook(
    () =>
      useExcelExport({
        fileName: 'things',
        sheetName: 'Things',
        columns,
        load,
        pageRows,
      }),
    { wrapper },
  );
}

describe('useExcelExport', () => {
  it('saves an .xlsx file with the columns and resolved names', async () => {
    serveDirectoryNames({ [USER]: 'Sara Ali' });
    const downloads = recordDownloads();
    const { result } = renderExport(() => [
      { code: 'A-1', qty: 4, createdBy: USER },
    ]);

    act(() => {
      result.current.exportExcel();
    });

    await waitFor(() => {
      expect(downloads.names).toHaveLength(1);
    });
    expect(downloads.names[0]).toMatch(/^things-\d{4}-\d{2}-\d{2}\.xlsx$/);
    expect(await readXlsxSheetNames(downloads.blobs[0])).toEqual(['Things']);
    expect(await readXlsxRows(downloads.blobs[0])).toEqual([
      ['Code', 'Qty', 'By'],
      ['A-1', '4', 'Sara Ali'],
    ]);
    await waitFor(() => {
      expect(result.current.isExporting).toBe(false);
    });
  });

  it('writes a right-to-left sheet in Arabic', async () => {
    await setTestLanguage('ar');
    const downloads = recordDownloads();
    const { result } = renderExport(() => [
      { code: 'A-1', qty: 1, createdBy: null },
    ]);

    act(() => {
      result.current.exportExcel();
    });

    await waitFor(() => {
      expect(downloads.blobs).toHaveLength(1);
    });
    const xml = (await unzipText(downloads.blobs[0])).get(
      'xl/worksheets/sheet1.xml',
    );
    expect(xml).toContain('rightToLeft="1"');
  });

  it('still downloads a cut result and warns the user', async () => {
    const warning = vi.spyOn(toast, 'warning');
    const downloads = recordDownloads();
    const { result } = renderExport(() =>
      Promise.resolve({
        rows: [{ code: 'A-1', qty: 1, createdBy: null }],
        total: 61_000,
        isTruncated: true,
      }),
    );

    act(() => {
      result.current.exportExcel();
    });

    await waitFor(() => {
      expect(warning).toHaveBeenCalledWith(
        tt('common.exportTruncated', { limit: '50,000', total: '61,000' }),
      );
    });
    expect(downloads.names).toHaveLength(1);
  });

  it('saves nothing when loading the rows fails', async () => {
    const downloads = recordDownloads();
    const { result } = renderExport(() => Promise.reject(new Error('network')));

    act(() => {
      result.current.exportExcel();
    });

    await waitFor(() => {
      expect(result.current.isExporting).toBe(false);
    });
    expect(downloads.names).toHaveLength(0);
  });

  it('exports only the current page without loading every row', async () => {
    const load = vi.fn(() => [{ code: 'ALL', qty: 9, createdBy: null }]);
    const downloads = recordDownloads();
    const { result } = renderExport(load, [
      { code: 'P-1', qty: 2, createdBy: null },
    ]);

    act(() => {
      result.current.exportPage?.();
    });

    await waitFor(() => {
      expect(downloads.blobs).toHaveLength(1);
    });
    expect(load).not.toHaveBeenCalled();
    expect(await readXlsxRows(downloads.blobs[0])).toEqual([
      ['Code', 'Qty', 'By'],
      ['P-1', '2'],
    ]);
  });

  it('has no page export when the page rows are not given', () => {
    const { result } = renderExport(() => []);

    expect(result.current.exportPage).toBeUndefined();
  });
});
