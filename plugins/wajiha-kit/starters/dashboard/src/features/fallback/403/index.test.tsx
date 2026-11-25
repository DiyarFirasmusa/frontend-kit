import { HttpResponse, http } from 'msw';
import { describe, expect, it } from 'vitest';
import { endpoints } from '@/constants/api';
import { useAuthStore } from '@/store/auth-store';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import ForbiddenError from './index';

describe('403 page sign-in-again action', () => {
  it('signs the user out and opens the login page', async () => {
    signIn({ permissions: [] });
    server.use(
      http.post(
        authApi(endpoints.auth.logout),
        () => new HttpResponse(null, { status: 200 }),
      ),
    );
    const { user, router } = await renderWithRouter(<ForbiddenError />, {
      path: '/403',
    });

    await user.click(
      await screen.findByRole('button', {
        name: tt('errorPages.forbidden.signInAgain'),
      }),
    );

    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/login');
    });
    expect(useAuthStore.getState().accessToken).toBeNull();
  });

  it('labels the button in Arabic', async () => {
    await setTestLanguage('ar');
    await renderWithRouter(<ForbiddenError />, { path: '/403' });

    expect(
      screen.getByRole('button', { name: 'تسجيل الدخول مرة أخرى' }),
    ).toBeInTheDocument();
  });
});
