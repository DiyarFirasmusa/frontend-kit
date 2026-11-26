import { useQuery } from '@tanstack/react-query';
import { act, waitFor } from '@testing-library/react';
import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { privateApi } from '@/api/client/private/private';
import { Toaster } from '@/components/ui/sonner';
import { createAppQueryClient } from '@/lib/query-client';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen } from '@/test/render';

function FailingList() {
  const query = useQuery({
    queryKey: ['probe-list'],
    queryFn: ({ signal }) => privateApi.get('/probe', { signal }),
  });
  return <p>{query.isError ? 'failed' : 'loading'}</p>;
}

describe('a failing list load', () => {
  afterEach(() => {
    act(() => {
      toast.dismiss();
    });
  });

  it('shows one error toast although the query retries once', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    let requests = 0;
    server.use(
      http.get(api('/probe'), () => {
        requests += 1;
        return new HttpResponse(null, { status: 500 });
      }),
    );
    const queryClient = createAppQueryClient();
    queryClient.setDefaultOptions({
      queries: { ...queryClient.getDefaultOptions().queries, retryDelay: 0 },
    });
    renderWithProviders(
      <>
        <Toaster />
        <FailingList />
      </>,
      { queryClient },
    );

    expect(await screen.findByText('failed')).toBeInTheDocument();
    await waitFor(() => {
      expect(requests).toBe(2);
    });
    expect(errorToast).toHaveBeenCalledTimes(2);
    expect(await screen.findAllByText(tt('common.errors.server'))).toHaveLength(
      1,
    );
  });
});
