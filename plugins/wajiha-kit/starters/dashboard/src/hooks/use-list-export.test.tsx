import { act, renderHook, waitFor } from '@testing-library/react';
import { toast } from 'sonner';
import { describe, expect, it, vi } from 'vitest';
import { createHookWrapper } from '@/test/hook-wrapper';
import { tt } from '@/test/i18n';
import { recordDownloads } from '@/test/xlsx';
import type { PageResponse } from '@/types/api/page';
import type { ExportColumn } from '@/types/export';
import { useListExport } from './use-list-export';

interface Row {
  code: string;
}

interface Params {
  page: number;
  pageSize: number;
  search: string;
}

const columns: ExportColumn<Row>[] = [
  { header: 'Code', value: (row) => row.code },
];

function pageOf(content: Row[], totalElements: number): PageResponse<Row> {
  return { content, totalElements, totalPages: 1, number: 0, size: 1000 };
}

function renderListExport(
  fetchAll: (params: Params) => Promise<PageResponse<Row>>,
) {
  const { wrapper } = createHookWrapper();
  return renderHook(
    () =>
      useListExport({
        fileName: 'things',
        sheetName: 'Things',
        columns,
        params: { page: 3, pageSize: 20, search: 'ab' },
        fetchAll,
        total: 5,
      }),
    { wrapper },
  );
}

describe('useListExport', () => {
  it('reads the whole filtered set as one page of the export size', async () => {
    const downloads = recordDownloads();
    const fetchAll = vi.fn((_params: Params) =>
      Promise.resolve(pageOf([{ code: 'A-1' }], 1)),
    );
    const { result } = renderListExport(fetchAll);

    act(() => {
      result.current.onExport();
    });

    await waitFor(() => {
      expect(downloads.names).toHaveLength(1);
    });
    expect(fetchAll).toHaveBeenCalledExactlyOnceWith({
      page: 1,
      pageSize: 1000,
      search: 'ab',
    });
  });

  it('warns with the real row cap when the backend cut the result', async () => {
    const warning = vi.spyOn(toast, 'warning');
    const downloads = recordDownloads();
    const { result } = renderListExport(() =>
      Promise.resolve(pageOf([{ code: 'A-1' }], 1200)),
    );

    act(() => {
      result.current.onExport();
    });

    await waitFor(() => {
      expect(warning).toHaveBeenCalledWith(
        tt('common.exportTruncated', { limit: '1,000', total: '1,200' }),
      );
    });
    expect(downloads.names).toHaveLength(1);
  });

  it('does not warn when every row fits', async () => {
    const warning = vi.spyOn(toast, 'warning');
    const downloads = recordDownloads();
    const { result } = renderListExport(() =>
      Promise.resolve(pageOf([{ code: 'A-1' }], 1)),
    );

    act(() => {
      result.current.onExport();
    });

    await waitFor(() => {
      expect(downloads.names).toHaveLength(1);
    });
    expect(warning).not.toHaveBeenCalled();
  });

  it('disables the button when the list is empty', () => {
    const { wrapper } = createHookWrapper();
    const { result } = renderHook(
      () =>
        useListExport({
          fileName: 'things',
          sheetName: 'Things',
          columns,
          params: { page: 1, pageSize: 20 },
          fetchAll: () => Promise.resolve(pageOf([], 0)),
          total: 0,
        }),
      { wrapper },
    );

    expect(result.current.disabled).toBe(true);
  });
});
