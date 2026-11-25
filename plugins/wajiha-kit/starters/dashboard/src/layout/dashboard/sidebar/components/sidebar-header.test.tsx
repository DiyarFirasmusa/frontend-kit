import type { QueryClient } from '@tanstack/react-query';
import { http, HttpResponse } from 'msw';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { qk } from '@/constants/query-keys';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import {
  createTestQueryClient,
  renderWithRouter,
  screen,
  waitFor,
} from '@/test/render';
import { SidebarHeader } from './sidebar-header';

beforeEach(async () => {
  await setTestLanguage('en');
});

function settled(queryClient: QueryClient) {
  return waitFor(() => {
    expect(queryClient.getQueryState(qk.workspace)?.status).toBe('success');
  });
}

describe('SidebarHeader', () => {
  it('renders the sidebar title once, with no subtitle line', async () => {
    await renderWithRouter(<SidebarHeader />, { path: '/' });
    expect(screen.getAllByText(tt('shell.sidebar.title'))).toHaveLength(1);
  });

  it('shows the loaded workspace name', async () => {
    const queryClient = createTestQueryClient();
    await renderWithRouter(<SidebarHeader />, { path: '/', queryClient });
    expect(await screen.findByText('الشركة التجريبية')).toBeInTheDocument();
  });

  it('falls back to an em dash once the config query settles without a name', async () => {
    server.use(
      http.get(api(endpoints.workspace.detail), () =>
        HttpResponse.json({ name: null, code: null }),
      ),
    );
    const queryClient = createTestQueryClient();
    await renderWithRouter(<SidebarHeader />, { path: '/', queryClient });
    await settled(queryClient);
    expect(screen.getByText(tt('shell.workspace.label'))).toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('falls back to an em dash for an empty-string name', async () => {
    server.use(
      http.get(api(endpoints.workspace.detail), () =>
        HttpResponse.json({ name: '   ', code: null }),
      ),
    );
    const queryClient = createTestQueryClient();
    await renderWithRouter(<SidebarHeader />, { path: '/', queryClient });
    await settled(queryClient);
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders no collapse control without a toggle handler', async () => {
    await renderWithRouter(<SidebarHeader />, { path: '/' });
    expect(screen.queryByRole('button')).not.toBeInTheDocument();
  });

  it('renders the collapse button and calls the toggle handler', async () => {
    const onToggleCollapse = vi.fn();
    const { user } = await renderWithRouter(
      <SidebarHeader onToggleCollapse={onToggleCollapse} />,
      { path: '/' },
    );
    const button = screen.getByRole('button', {
      name: tt('shell.sidebar.collapse'),
    });
    expect(button).toHaveAttribute('aria-expanded', 'true');
    await user.click(button);
    expect(onToggleCollapse).toHaveBeenCalledTimes(1);
  });

  it('shows only icons and an expand button when collapsed', async () => {
    await renderWithRouter(
      <SidebarHeader collapsed onToggleCollapse={() => {}} />,
      { path: '/' },
    );
    expect(
      screen.queryByText(tt('shell.sidebar.title')),
    ).not.toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: tt('shell.sidebar.expand') }),
    ).toHaveAttribute('aria-expanded', 'false');
    expect(
      screen.getByRole('img', {
        name: new RegExp(tt('shell.workspace.label')),
      }),
    ).toBeInTheDocument();
  });

  it('renders the Arabic collapse label', async () => {
    await setTestLanguage('ar');
    await renderWithRouter(<SidebarHeader onToggleCollapse={() => {}} />, {
      path: '/',
    });
    expect(
      screen.getByRole('button', { name: tt('shell.sidebar.collapse') }),
    ).toBeInTheDocument();
  });
});
