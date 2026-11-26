import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterEach, vi } from 'vitest';
import { useMenuStore } from '@/shared/store/menu-store';
import { useThemeStore } from '@/shared/store/theme-store';

// The dom project shares one jsdom per worker (isolate: false), so everything a test can leave behind is
// reset here: the rendered tree, storage, the theme attribute and the two stores.
afterEach(() => {
  cleanup();
  window.localStorage.clear();
  window.sessionStorage.clear();
  document.documentElement.removeAttribute('data-theme');
  useThemeStore.setState({ choice: undefined });
  useMenuStore.setState({ open: false });
});

// jsdom has no matchMedia; the theme store reads it.
if (typeof window !== 'undefined' && typeof window.matchMedia !== 'function') {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: (query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      addListener: vi.fn(),
      removeListener: vi.fn(),
      dispatchEvent: vi.fn(),
    }),
  });
}
