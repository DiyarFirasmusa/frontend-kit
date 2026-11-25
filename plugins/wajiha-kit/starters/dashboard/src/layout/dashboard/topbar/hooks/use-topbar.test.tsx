import { HttpResponse, delay, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { usePermissionStore } from '@/store/permission-store';
import { signIn } from '@/test/fixtures/auth';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import { useTopbar } from './use-topbar';

function TopbarProbe() {
  const { displayName, jobTitle, firstRole, initials, logout } = useTopbar();
  return (
    <div>
      <p>
        name:{displayName} job:{jobTitle ?? '—'} role:{firstRole}
      </p>
      <p>initials:{initials}</p>
      <button type="button" onClick={logout}>
        sign-out
      </button>
    </div>
  );
}

describe('useTopbar', () => {
  it('shows the login name and first role until /me arrives', async () => {
    signIn({ roles: ['ADMIN', 'VIEWER'] });
    server.use(
      http.get(api(endpoints.auth.me), async () => {
        await delay('infinite');
        return HttpResponse.json({});
      }),
    );
    await renderWithRouter(<TopbarProbe />, { path: '/' });

    expect(screen.getByText('name:admin job:— role:ADMIN')).toBeInTheDocument();
    expect(screen.getByText('initials:AD')).toBeInTheDocument();
  });

  it('exposes the display name, job title and initials from /me', async () => {
    signIn({ roles: ['ADMIN'] });
    await renderWithRouter(<TopbarProbe />, { path: '/' });

    expect(
      await screen.findByText('name:Ali Karkhi job:Storekeeper role:ADMIN'),
    ).toBeInTheDocument();
    expect(screen.getByText('initials:AK')).toBeInTheDocument();
  });

  it('falls back to the em dash for name, role and initials without a session', async () => {
    await renderWithRouter(<TopbarProbe />, { path: '/' });

    expect(screen.getByText('name:— job:— role:—')).toBeInTheDocument();
    expect(screen.getByText('initials:—')).toBeInTheDocument();
  });

  it('logout clears the session and permissions', async () => {
    signIn({ roles: ['ADMIN'] });
    const { user } = await renderWithRouter(<TopbarProbe />, { path: '/' });

    await user.click(screen.getByRole('button', { name: 'sign-out' }));

    await waitFor(() => {
      expect(useAuthStore.getState().accessToken).toBeNull();
    });
    expect(usePermissionStore.getState().roles).toEqual([]);
  });
});
