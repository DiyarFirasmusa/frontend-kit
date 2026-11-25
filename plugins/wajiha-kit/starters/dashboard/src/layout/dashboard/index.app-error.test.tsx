import { act } from 'react';
import { describe, expect, it } from 'vitest';
import { useAppErrorStore } from '@/store/app-error-store';
import { tt } from '@/test/i18n';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import { DashboardLayout } from './index';

function renderLayout() {
  return renderWithRouter(
    <DashboardLayout>
      <p>page content</p>
    </DashboardLayout>,
    { path: '/' },
  );
}

describe('DashboardLayout page-level errors', () => {
  it('replaces the page with the server error page and keeps the shell', async () => {
    await renderLayout();
    expect(screen.getByRole('main')).toHaveTextContent('page content');

    act(() => {
      useAppErrorStore.getState().setError({
        kind: 'server',
        status: 500,
        method: 'GET',
        path: '/api/items',
        correlationId: null,
        occurredAt: '2026-10-17T08:30:00Z',
      });
    });

    expect(screen.getByText('page content')).not.toBeVisible();
    expect(
      screen.getByRole('heading', { name: tt('errorPages.server.title') }),
    ).toBeInTheDocument();
    expect(screen.getAllByRole('banner').length).toBeGreaterThan(0);
  });

  it('shows the network error page as soon as the browser goes offline', async () => {
    await renderLayout();

    act(() => {
      window.dispatchEvent(new Event('offline'));
    });

    await waitFor(() => {
      expect(
        screen.getByRole('heading', { name: tt('errorPages.network.title') }),
      ).toBeInTheDocument();
    });
    expect(useAppErrorStore.getState().error?.kind).toBe('network');
  });
});
