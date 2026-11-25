import { renderHook, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { createHookWrapper } from '@/test/hook-wrapper';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { createTestQueryClient } from '@/test/render';
import { useDirectorySearch } from './use-directory-search';

describe('useDirectorySearch', () => {
  it('searches the kind with q and limit and maps entries to options', async () => {
    const requests: URL[] = [];
    server.use(
      http.get(api(endpoints.directory.search), ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json([
          { id: 'e-1', name: 'Sara Ali', subtitle: 'Storekeeper' },
          { id: 'e-2', name: null, subtitle: null },
        ]);
      }),
    );
    const { wrapper } = createHookWrapper(createTestQueryClient());
    const { result } = renderHook(
      () => useDirectorySearch('EMPLOYEE', ' sar '),
      {
        wrapper,
      },
    );

    await waitFor(() => {
      expect(result.current.options).toHaveLength(2);
    });
    expect(result.current.options.map((option) => option.value)).toEqual([
      'e-1',
      'e-2',
    ]);
    expect(requests[0]?.searchParams.get('kind')).toBe('EMPLOYEE');
    expect(requests[0]?.searchParams.get('q')).toBe('sar');
    expect(requests[0]?.searchParams.get('limit')).toBe('20');
  });

  it('sends no request while disabled', () => {
    const { queryClient, wrapper } = createHookWrapper(createTestQueryClient());
    const { result } = renderHook(() => useDirectorySearch('USER', '', false), {
      wrapper,
    });
    expect(queryClient.isFetching()).toBe(0);
    expect(result.current.options).toEqual([]);
  });

  it('omits q when the text is blank and reports a failure without throwing', async () => {
    const requests: URL[] = [];
    server.use(
      http.get(api(endpoints.directory.search), ({ request }) => {
        requests.push(new URL(request.url));
        return HttpResponse.json({ message: 'down' }, { status: 500 });
      }),
    );
    const { wrapper } = createHookWrapper(createTestQueryClient());
    const { result } = renderHook(() => useDirectorySearch('ORG_UNIT', '  '), {
      wrapper,
    });

    await waitFor(() => {
      expect(result.current.isError).toBe(true);
    });
    expect(requests[0]?.searchParams.has('q')).toBe(false);
    expect(result.current.options).toEqual([]);
  });
});
