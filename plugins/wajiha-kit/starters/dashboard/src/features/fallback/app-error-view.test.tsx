import { QueryClient } from '@tanstack/react-query';
import { describe, expect, it, vi } from 'vitest';
import { useAppErrorStore, type AppError } from '@/store/app-error-store';
import { tt } from '@/test/i18n';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import { AppErrorView } from './app-error-view';

const NETWORK: AppError = {
  kind: 'network',
  status: null,
  method: 'GET',
  path: '/api/items',
  correlationId: null,
  occurredAt: '2026-10-17T08:30:00Z',
};

const SERVER: AppError = {
  ...NETWORK,
  kind: 'server',
  status: 503,
  correlationId: 'corr-42',
};

describe('AppErrorView', () => {
  it('shows the server error with its status and reference', async () => {
    useAppErrorStore.getState().setError(SERVER);
    await renderWithRouter(<AppErrorView error={SERVER} />, { path: '/items' });

    expect(
      screen.getByRole('heading', { name: tt('errorPages.server.title') }),
    ).toBeInTheDocument();
    expect(screen.getByText('503')).toBeInTheDocument();
    expect(screen.getByText('corr-42')).toBeInTheDocument();
    expect(screen.getByText('GET /api/items')).toBeInTheDocument();
  });

  it('clears the error and refetches active queries on retry', async () => {
    useAppErrorStore.getState().setError(SERVER);
    const refetch = vi.spyOn(QueryClient.prototype, 'refetchQueries');
    const { user } = await renderWithRouter(<AppErrorView error={SERVER} />, {
      path: '/items',
    });

    await user.click(
      screen.getByRole('button', { name: tt('errorPages.retry') }),
    );

    expect(useAppErrorStore.getState().error).toBeNull();
    expect(refetch).toHaveBeenCalledWith({ type: 'active' });
    refetch.mockRestore();
  });

  it('retries a network error by itself when the browser comes back online', async () => {
    useAppErrorStore.getState().setError(NETWORK);
    await renderWithRouter(<AppErrorView error={NETWORK} />, {
      path: '/items',
    });

    window.dispatchEvent(new Event('online'));

    await waitFor(() => {
      expect(useAppErrorStore.getState().error).toBeNull();
    });
  });

  it('goes home and clears the error from the secondary action', async () => {
    useAppErrorStore.getState().setError(SERVER);
    const { user, router } = await renderWithRouter(
      <AppErrorView error={SERVER} />,
      { path: '/items' },
    );

    await user.click(
      screen.getByRole('button', { name: tt('errorPages.goHome') }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
    expect(useAppErrorStore.getState().error).toBeNull();
  });
});
