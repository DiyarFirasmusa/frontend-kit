import {
  createMemoryHistory,
  createRootRoute,
  createRoute,
  createRouter,
  RouterProvider,
} from '@tanstack/react-router';
import { act, render, screen } from '@testing-library/react';
import userEvent from '@testing-library/user-event';
import { I18nextProvider } from 'react-i18next';
import { beforeEach, describe, expect, it, vi } from 'vitest';
import { createI18n } from '@/shared/lib/i18n/create-i18n';
import { LANGUAGES, LOCALES, otherLocales, type Locale } from '@/shared/lib/i18n/languages';
import { SiteHeader } from './site-header';

/** The header inside a tiny router (one splat page for every path), so its links render as in the app. */
async function renderHeader(locale: Locale, path = `/${locale}/about`, history: string[] = [path]) {
  const root = createRootRoute();
  const page = createRoute({
    getParentRoute: () => root,
    path: '$locale/$',
    component: () => <SiteHeader locale={locale} />,
  });
  const router = createRouter({
    routeTree: root.addChildren([page]),
    history: createMemoryHistory({ initialEntries: history, initialIndex: history.length - 1 }),
  });
  await act(async () => {
    await router.load();
  });
  const view = render(
    <I18nextProvider i18n={createI18n(locale)}>
      <RouterProvider router={router} />
    </I18nextProvider>,
  );
  return { ...view, router };
}

describe('SiteHeader', () => {
  beforeEach(() => {
    // The router scrolls to the top after a navigation; jsdom has no scrolling.
    vi.spyOn(window, 'scrollTo').mockImplementation(() => undefined);
  });

  it('the phone menu starts closed, opens from its button and closes with Escape, returning focus', async () => {
    const user = userEvent.setup();
    await renderHeader('en');
    const button = await screen.findByRole('button', { name: 'Open menu' });
    expect(button).toHaveAttribute('aria-expanded', 'false');

    await user.click(button);
    const close = screen.getByRole('button', { name: 'Close menu' });
    expect(close).toHaveAttribute('aria-expanded', 'true');

    await user.keyboard('{Escape}');
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveFocus();
  });

  it('the browser Back button closes the open menu (it must not stay open over the previous page)', async () => {
    const user = userEvent.setup();
    const { router } = await renderHeader('en', '/en/about', ['/en', '/en/about']);
    await user.click(await screen.findByRole('button', { name: 'Open menu' }));
    expect(screen.getByRole('button', { name: 'Close menu' })).toHaveAttribute(
      'aria-expanded',
      'true',
    );

    await act(async () => {
      router.history.back();
    });
    expect(router.state.location.pathname).toBe('/en');
    expect(await screen.findByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
    // Going forward again does not bring the old menu back either.
    await act(async () => {
      router.history.forward();
    });
    expect(await screen.findByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('clicking a menu link closes the menu', async () => {
    const user = userEvent.setup();
    await renderHeader('en');
    await user.click(await screen.findByRole('button', { name: 'Open menu' }));
    await user.click(screen.getByRole('link', { name: 'Contact' }));
    expect(screen.getByRole('button', { name: 'Open menu' })).toHaveAttribute(
      'aria-expanded',
      'false',
    );
  });

  it('links to every other language, by its own name, on the same page', async () => {
    for (const locale of LOCALES) {
      const { unmount } = await renderHeader(locale);
      for (const other of otherLocales(locale)) {
        const link = await screen.findByRole('link', { name: LANGUAGES[other].label });
        expect(link).toHaveAttribute('href', `/${other}/about`);
        expect(link).toHaveAttribute('lang', other);
        expect(link).toHaveAttribute('hreflang', LANGUAGES[other].hreflang);
      }
      expect(screen.queryByRole('link', { name: LANGUAGES[locale].label })).toBeNull();
      unmount();
    }
  });

  it('remembers the chosen language in the cookie the "/" redirect reads', async () => {
    const user = userEvent.setup();
    await renderHeader('en');
    const link = await screen.findByRole('link', { name: LANGUAGES.ar.label });
    // jsdom would navigate on a link click; the handler runs first, which is what is under test.
    link.addEventListener('click', (event) => event.preventDefault());
    await user.click(link);
    expect(document.cookie).toContain('lang=ar');
    document.cookie = 'lang=; max-age=0; path=/';
  });
});
