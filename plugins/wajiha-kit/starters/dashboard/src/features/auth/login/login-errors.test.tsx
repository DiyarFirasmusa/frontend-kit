import { HttpResponse, http } from 'msw';
import { toast } from 'sonner';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { endpoints } from '@/constants/api';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { useAuthStore } from '@/store/auth-store';
import { setTestLanguage, tt } from '@/test/i18n';
import { authApi } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithRouter, screen, waitFor } from '@/test/render';
import LoginContainer from './index';

async function submitLogin() {
  const view = await renderWithRouter(<LoginContainer />, { path: '/login' });
  await view.user.type(screen.getByLabelText(tt('login.username')), 'admin');
  await view.user.type(
    screen.getByLabelText(new RegExp(tt('login.password'))),
    'wrong-password',
  );
  await view.user.click(
    screen.getByRole('button', { name: tt('login.submit') }),
  );
  return view;
}

describe('LoginContainer shared feedback', () => {
  beforeAll(async () => {
    await loadFeatureLocale('auth/login');
  });

  it.each(['en', 'ar'] as const)(
    'shows one backend error via the client (%s)',
    async (language) => {
      await setTestLanguage(language);
      await loadFeatureLocale('auth/login');
      const errorToast = vi.spyOn(toast, 'error');
      server.use(
        http.post(authApi(endpoints.auth.login), () =>
          HttpResponse.json(
            {
              en_error: 'Invalid credentials',
              ar_error: 'بيانات الدخول غير صحيحة',
            },
            { status: 400 },
          ),
        ),
      );
      const { router } = await submitLogin();
      await waitFor(() => {
        const message =
          language === 'ar' ? 'بيانات الدخول غير صحيحة' : 'Invalid credentials';
        expect(errorToast).toHaveBeenCalledExactlyOnceWith(message, {
          id: message,
        });
      });
      expect(screen.getByText(tt('login.subtitle'))).toBeInTheDocument();
      expect(screen.queryByRole('alert')).not.toBeInTheDocument();
      expect(useAuthStore.getState().accessToken).toBeNull();
      expect(router.state.location.pathname).toBe('/login');
      await waitFor(() => {
        expect(
          screen.getByRole('button', { name: tt('login.submit') }),
        ).toBeEnabled();
      });
    },
  );

  it('uses the existing non-field error parser', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    await submitLogin();
    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledExactlyOnceWith(
        'No active account found with the given credentials',
        { id: 'No active account found with the given credentials' },
      );
    });
  });

  it('falls back for an empty server error and allows another attempt', async () => {
    const errorToast = vi.spyOn(toast, 'error');
    server.use(
      http.post(
        authApi(endpoints.auth.login),
        () => new HttpResponse(null, { status: 500 }),
      ),
    );
    const { user, router } = await submitLogin();
    await waitFor(() => {
      expect(errorToast).toHaveBeenCalledExactlyOnceWith(
        tt('common.errors.server'),
        { id: tt('common.errors.server') },
      );
    });
    server.resetHandlers();
    await user.clear(screen.getByLabelText(new RegExp(tt('login.password'))));
    await user.type(
      screen.getByLabelText(new RegExp(tt('login.password'))),
      'secret',
    );
    await user.click(screen.getByRole('button', { name: tt('login.submit') }));
    await waitFor(() => {
      expect(router.state.location.pathname).toBe('/');
    });
    expect(errorToast).toHaveBeenCalledTimes(1);
  });
});
