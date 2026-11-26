import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { useToastStore } from '@/shared/store/toast-store';
import { tt } from '@/test/i18n';
import { screen, waitFor } from '@/test/render';
import { renderAtUrl } from '@/test/render-router';
import { useAuthStore } from '../store/auth-store';
import { usePermissionStore } from '../store/permission-store';
import { LoginPage } from './index';

async function submit(
  user: Awaited<ReturnType<typeof renderAtUrl>>['user'],
  username: string,
  password = 'secret',
) {
  await user.type(
    await screen.findByLabelText(new RegExp(`^${tt('login.username')}`, 'u')),
    username,
  );
  await user.type(screen.getByLabelText(new RegExp(`^${tt('login.password')}`, 'u')), password);
  await user.click(screen.getByRole('button', { name: tt('login.submit') }));
}

describe('login page', () => {
  // The API client sends the page language (<html lang>); the mock answers in it.
  beforeEach(() => {
    document.documentElement.lang = 'en';
  });
  afterEach(() => {
    document.documentElement.lang = '';
  });

  it('says the session ended when the user was sent here by a 401', async () => {
    await renderAtUrl(<LoginPage locale="en" expired />, { url: '/en/admin/login?reason=expired' });
    expect(await screen.findByRole('status')).toHaveTextContent(tt('login.sessionEnded'));
  });

  it('shows no such message on a normal visit', async () => {
    await renderAtUrl(<LoginPage locale="en" />, { url: '/en/admin/login' });
    await screen.findByRole('heading', { level: 1, name: tt('login.title') });
    expect(screen.queryByRole('status')).not.toBeInTheDocument();
  });

  it('asks for both fields before it sends anything', async () => {
    const { user } = await renderAtUrl(<LoginPage locale="en" />, { url: '/en/admin/login' });
    await user.click(await screen.findByRole('button', { name: tt('login.submit') }));
    expect(await screen.findByText(tt('login.usernameRequired'))).toBeInTheDocument();
    expect(screen.getByText(tt('login.passwordRequired'))).toBeInTheDocument();
  });

  it('keeps the user out and tells them why when the login is refused', async () => {
    const { user } = await renderAtUrl(<LoginPage locale="en" />, { url: '/en/admin/login' });
    await submit(user, 'blocked');
    await waitFor(() => {
      expect(useToastStore.getState().toasts).toHaveLength(1);
    });
    expect(useToastStore.getState().toasts[0]).toMatchObject({
      tone: 'error',
      message: { text: 'Wrong user name or password' },
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('stores the session and the rights of a successful login', async () => {
    const { user } = await renderAtUrl(<LoginPage locale="en" />, { url: '/en/admin/login' });
    await submit(user, 'viewer');
    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toMatch(/^mock-token-viewer-/u);
    });
    // The viewer holds every read permission and no other (a resource added later is readable too).
    const { permissions } = usePermissionStore.getState();
    expect(permissions).toContain('supplier:read');
    expect(permissions.every((permission) => permission.endsWith(':read'))).toBe(true);
  });
});
