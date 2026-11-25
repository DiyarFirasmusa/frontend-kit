import { afterEach, describe, expect, it, vi } from 'vitest';
import { useAuthStore } from '@/store/auth-store';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithRouter, screen } from '@/test/render';
import { RootErrorFallback } from './root-error-fallback';

describe('RootErrorFallback', () => {
  afterEach(() => {
    document.documentElement.className = '';
    document.documentElement.removeAttribute('lang');
    document.documentElement.removeAttribute('dir');
    window.localStorage.clear();
  });

  it('sets html lang and dir from the active language', async () => {
    await setTestLanguage('en');
    await renderWithRouter(<RootErrorFallback />, { path: '/500' });
    expect(document.documentElement.lang).toBe('en');
    expect(document.documentElement.dir).toBe('ltr');
  });

  it('signs in again: clears the saved session and opens /login', async () => {
    signIn();
    const assign = vi.fn();
    vi.stubGlobal('location', { ...window.location, assign });
    const { user } = await renderWithRouter(<RootErrorFallback />, {
      path: '/',
    });

    await user.click(
      screen.getByRole('button', { name: tt('errorPages.signInAgain') }),
    );

    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(assign).toHaveBeenCalledWith('/login');
    vi.unstubAllGlobals();
  });
});
