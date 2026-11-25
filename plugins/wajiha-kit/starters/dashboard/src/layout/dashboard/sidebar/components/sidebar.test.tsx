import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { qk } from '@/constants/query-keys';
import { env } from '@/env';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import {
  createTestQueryClient,
  renderWithRouter,
  screen,
  waitFor,
} from '@/test/render';
import { DashboardSidebar } from './sidebar';

beforeEach(async () => {
  await setTestLanguage('en');
});

describe('DashboardSidebar', () => {
  it('renders the sidebar title', async () => {
    await renderWithRouter(<DashboardSidebar />, { path: '/' });
    expect(screen.getByText(tt('shell.sidebar.title'))).toBeInTheDocument();
  });

  it('renders the nav landmark', async () => {
    await renderWithRouter(<DashboardSidebar />, { path: '/' });
    expect(
      screen.getByRole('navigation', { name: tt('shell.nav.label') }),
    ).toBeInTheDocument();
  });

  it('renders the version in the footer', async () => {
    await renderWithRouter(<DashboardSidebar />, { path: '/' });
    expect(screen.getByText(`v${env.VITE_APP_VERSION}`)).toBeInTheDocument();
  });

  it('shows an em dash for the workspace name when the config has none', async () => {
    server.use(
      http.get(api(endpoints.workspace.detail), () =>
        HttpResponse.json({ name: null, code: null }),
      ),
    );
    const queryClient = createTestQueryClient();
    await renderWithRouter(<DashboardSidebar />, { path: '/', queryClient });
    await waitFor(() => {
      expect(queryClient.getQueryState(qk.workspace)?.status).toBe('success');
    });
    expect(screen.getByText(tt('shell.workspace.label'))).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders the Arabic brand title and nav landmark name', async () => {
    await setTestLanguage('ar');
    await renderWithRouter(<DashboardSidebar />, { path: '/' });
    expect(screen.getByText(tt('shell.sidebar.title'))).toBeInTheDocument();
    expect(
      screen.getByRole('navigation', { name: tt('shell.nav.label') }),
    ).toBeInTheDocument();
  });
});
