import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { signIn } from '@/test/fixtures/auth';
import { tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import { DashboardTopbar } from './topbar';

describe('DashboardTopbar user', () => {
  it('names the user menu trigger from the display name and job title', async () => {
    signIn({ roles: ['ADMIN'] });
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    const trigger = await screen.findByRole('button', { name: /Ali Karkhi/ });
    expect(trigger).toHaveAttribute('aria-haspopup', 'menu');
    expect(within(trigger).getByText('Ali Karkhi')).toBeInTheDocument();
    expect(within(trigger).getByText('Storekeeper')).toBeInTheDocument();
    expect(within(trigger).getByText('AK')).toBeInTheDocument();
  });

  it('falls back to the translated role when /me has no job title', async () => {
    signIn({ roles: ['ADMIN'] });
    server.use(
      http.get(api(endpoints.auth.me), () =>
        HttpResponse.json({ displayName: 'Ali Karkhi', roles: ['ADMIN'] }),
      ),
    );
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    const trigger = await screen.findByRole('button', { name: /Ali Karkhi/ });
    expect(
      within(trigger).getByText(tt('shell.roles.ADMIN')),
    ).toBeInTheDocument();
  });

  it('shows the profile photo when /me has an avatar', async () => {
    signIn({ roles: ['ADMIN'] });
    server.use(
      http.get(api(endpoints.auth.me), () =>
        HttpResponse.json({
          displayName: 'Ali Karkhi',
          avatarUrl: 'https://cdn.test/ali.png',
        }),
      ),
    );
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    const trigger = await screen.findByRole('button', { name: /Ali Karkhi/ });
    await waitFor(() => {
      expect(trigger.querySelector('img')).toHaveAttribute(
        'src',
        'https://cdn.test/ali.png',
      );
    });
  });
});
