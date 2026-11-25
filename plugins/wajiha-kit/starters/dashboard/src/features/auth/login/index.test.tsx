import { beforeAll, describe, expect, it } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import LoginContainer from './index';

describe('LoginContainer', () => {
  beforeAll(async () => {
    await loadFeatureLocale('auth/login');
  });

  it('shows the subtitle and no alert on first render', async () => {
    await renderWithRouter(<LoginContainer />, { path: '/login' });

    expect(screen.getByText(tt('login.subtitle'))).toBeInTheDocument();
    expect(screen.queryByRole('alert')).not.toBeInTheDocument();
  });

  it('shows validation messages and focuses the first invalid field on empty submit', async () => {
    const { user } = await renderWithRouter(<LoginContainer />, {
      path: '/login',
    });

    await user.click(screen.getByRole('button', { name: tt('login.submit') }));

    expect(
      await screen.findByText(tt('login.usernameRequired')),
    ).toBeInTheDocument();
    expect(screen.getByText(tt('login.passwordRequired'))).toBeInTheDocument();
    expect(screen.getByLabelText(tt('login.username'))).toHaveFocus();
  });

  it('focuses the password when only the password is missing', async () => {
    const { user } = await renderWithRouter(<LoginContainer />, {
      path: '/login',
    });
    await user.type(screen.getByLabelText(tt('login.username')), 'admin');
    await user.click(screen.getByRole('button', { name: tt('login.submit') }));
    expect(
      await screen.findByText(tt('login.passwordRequired')),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(new RegExp(tt('login.password'))),
    ).toHaveFocus();
  });

  it('signs the user in, stores the session and navigates home', async () => {
    const { user, router } = await renderWithRouter(<LoginContainer />, {
      path: '/login',
    });

    await user.type(screen.getByLabelText(tt('login.username')), 'admin');
    await user.type(
      screen.getByLabelText(new RegExp(tt('login.password'))),
      'secret',
    );
    await user.click(screen.getByRole('button', { name: tt('login.submit') }));

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).not.toBeNull();
    });
    expect(useAuthStore.getState().user?.username).toBe('admin');
    expect(usePermissionStore.getState().permissions).toContain(
      'employee:read',
    );
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
  });

  it('renders the Arabic title and shows the required indicator on the password label', async () => {
    await setTestLanguage('ar');
    // setTestLanguage bypasses the app's setLanguage() bundle-merge step, so
    // re-merge this feature's Arabic bundle explicitly (idempotent).
    await loadFeatureLocale('auth/login');
    await renderWithRouter(<LoginContainer />, { path: '/login' });

    expect(
      screen.getByRole('heading', { name: tt('login.title') }),
    ).toBeInTheDocument();
    const passwordLabel = screen.getByText(tt('login.password'), {
      exact: false,
      selector: 'label',
    });
    expect(passwordLabel).toHaveTextContent('*');
  });
});
