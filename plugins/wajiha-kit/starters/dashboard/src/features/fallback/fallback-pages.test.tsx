import { afterEach, describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithRouter, screen } from '@/test/render';
import UnauthorizedError from './401';
import ForbiddenError from './403';
import NotFoundError from './404';

const CASES = [
  {
    name: '401',
    Page: UnauthorizedError,
    path: '/401',
    title: 'errorPages.unauthorized.title',
    back: 'errorPages.goBack',
    primary: 'common.signIn',
    target: '/login',
  },
  {
    name: '403',
    Page: ForbiddenError,
    path: '/403',
    title: 'errorPages.forbidden.title',
    back: 'errorPages.goBack',
    primary: 'errorPages.goHome',
    target: '/',
  },
  {
    name: '404',
    Page: NotFoundError,
    path: '/404',
    title: 'errorPages.states.notFound.title',
    back: 'errorPages.states.notFound.backToList',
    primary: 'nav.dashboard',
    target: '/',
  },
] as const;

describe('fallback error pages', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it.each(CASES)(
    '$name renders its code, title and both actions',
    async ({ name, Page, path, title, primary, back }) => {
      const consoleError = vi.spyOn(console, 'error');
      await renderWithRouter(<Page />, { path });

      expect(screen.getByText(new RegExp(`^${name}`))).toBeInTheDocument();
      expect(
        screen.getByRole('heading', { level: 1, name: tt(title) }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: tt(primary) }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: tt(back) })[0],
      ).toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
    },
  );

  it.each(CASES)(
    '$name primary action navigates to $target',
    async ({ Page, path, primary, target }) => {
      const { user, router } = await renderWithRouter(<Page />, { path });

      await user.click(screen.getByRole('button', { name: tt(primary) }));

      expect(router.state.location.pathname).toBe(target);
    },
  );

  it.each(CASES)(
    '$name back action falls back to home when there is no history',
    async ({ Page, path, back }) => {
      const { user, router } = await renderWithRouter(<Page />, { path });

      await user.click(
        screen.getAllByRole('button', { name: tt(back) })[0] as HTMLElement,
      );

      expect(router.state.location.pathname).toBe('/');
    },
  );

  it.each(CASES)(
    '$name renders the Arabic title and actions',
    async ({ Page, path, title, primary, back }) => {
      const consoleError = vi.spyOn(console, 'error');
      await setTestLanguage('ar');
      await renderWithRouter(<Page />, { path });

      expect(
        screen.getByRole('heading', { level: 1, name: tt(title) }),
      ).toBeInTheDocument();
      expect(
        screen.getByRole('button', { name: tt(primary) }),
      ).toBeInTheDocument();
      expect(
        screen.getAllByRole('button', { name: tt(back) })[0],
      ).toBeInTheDocument();
      expect(consoleError).not.toHaveBeenCalled();
    },
  );
});
