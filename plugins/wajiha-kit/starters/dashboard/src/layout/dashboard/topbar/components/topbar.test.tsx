import { HttpResponse, delay, http } from 'msw';
import { afterEach, describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import i18n from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor, within } from '@/test/render';
import { DashboardTopbar } from './topbar';

describe('DashboardTopbar', () => {
  afterEach(async () => {
    if (i18n.language !== 'en') {
      await i18n.changeLanguage('en');
    }
  });

  it('lists the light theme button before the dark one', async () => {
    await renderWithRouter(<DashboardTopbar />, { path: '/' });
    const group = screen.getByRole('group', { name: tt('common.theme') });
    const names = within(group)
      .getAllByRole('button')
      .map((button) => button.getAttribute('aria-label'));
    expect(names).toEqual([tt('common.light'), tt('common.dark')]);
  });

  it('marks the active theme button with aria-pressed and switches theme', async () => {
    const { user } = await renderWithRouter(<DashboardTopbar />, { path: '/' });
    const dark = screen.getByRole('button', { name: tt('common.dark') });
    const light = screen.getByRole('button', { name: tt('common.light') });

    expect(light).toHaveAttribute('aria-pressed', 'true');
    expect(dark).toHaveAttribute('aria-pressed', 'false');

    await user.click(dark);

    await waitFor(() => {
      expect(dark).toHaveAttribute('aria-pressed', 'true');
    });
    expect(light).toHaveAttribute('aria-pressed', 'false');
    expect(document.documentElement.classList.contains('dark')).toBe(true);
  });

  it('opens the account menu with a logout item', async () => {
    signIn({ roles: ['ADMIN'] });
    const { user } = await renderWithRouter(<DashboardTopbar />, { path: '/' });

    await user.click(await screen.findByRole('button', { name: /Ali Karkhi/ }));

    expect(
      await screen.findByRole('menuitem', { name: tt('common.logout') }),
    ).toBeInTheDocument();
  });

  it('shows the em dash for name, initials and role when no user is signed in', async () => {
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    const trigger = screen.getByRole('button', { name: /—/ });
    expect(within(trigger).getAllByText('—')).toHaveLength(3);
  });

  it('shows the login name, its initials and the role while /me is loading', async () => {
    signIn({ roles: ['ADMIN'] });
    server.use(
      http.get(api(endpoints.auth.me), async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    const trigger = screen.getByRole('button', { name: /admin/ });
    expect(within(trigger).getByText('AD')).toBeInTheDocument();
    expect(within(trigger).getByText('admin')).toBeInTheDocument();
    expect(
      within(trigger).getByText(tt('shell.roles.ADMIN')),
    ).toBeInTheDocument();
  });

  it('falls back to the raw role code when no label exists', async () => {
    signIn({ roles: ['CUSTOM_ROLE'] });
    server.use(http.get(api(endpoints.auth.me), () => HttpResponse.json({})));
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    expect(await screen.findByText('CUSTOM_ROLE')).toBeInTheDocument();
  });

  it('switches the app language from the language menu', async () => {
    const { user } = await renderWithRouter(<DashboardTopbar />, { path: '/' });

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`^${tt('common.language')}`),
      }),
    );
    expect(
      await screen.findByText(tt('shell.language.menuTitle')),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('menuitem', { name: tt('shell.language.arabic') }),
    );

    await waitFor(() => {
      expect(i18n.resolvedLanguage ?? i18n.language).toBe('ar');
    });
  });

  it('names the current language in the language button label', async () => {
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    expect(
      screen.getByRole('button', {
        name: `${tt('common.language')}: ${tt('shell.language.english')}`,
      }),
    ).toBeInTheDocument();
  });

  it('marks the current language in the menu and does not switch on it', async () => {
    const { user } = await renderWithRouter(<DashboardTopbar />, { path: '/' });

    await user.click(
      screen.getByRole('button', {
        name: new RegExp(`^${tt('common.language')}`),
      }),
    );
    const current = await screen.findByRole('menuitem', {
      name: new RegExp(tt('shell.language.current')),
    });
    expect(current).toHaveAttribute('aria-current', 'true');
    await user.click(current);

    expect(i18n.resolvedLanguage ?? i18n.language).toBe('en');
  });

  it('shows the Arabic theme labels after switching language', async () => {
    await renderWithRouter(<DashboardTopbar />, { path: '/' });
    await setTestLanguage('ar');

    expect(
      await screen.findByRole('button', { name: tt('common.dark') }),
    ).toBeInTheDocument();
  });

  it('renders the global search combobox at the start of the bar', async () => {
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    expect(
      screen.getByRole('combobox', { name: tt('search.label') }),
    ).toBeInTheDocument();
  });

  it('renders the notifications button next to the language button', async () => {
    await renderWithRouter(<DashboardTopbar />, { path: '/' });

    expect(
      await screen.findByRole('button', { name: tt('notifications.open') }),
    ).toHaveAttribute('aria-haspopup', 'dialog');
  });
});
