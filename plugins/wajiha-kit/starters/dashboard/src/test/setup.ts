import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import i18n from '@/lib/i18n/i18n';
import { server } from './msw/server';
import { resetStores } from './stores';

/* ── DOM APIs jsdom does not implement ─────────────────────────────────── */

if (!window.matchMedia) {
  Object.defineProperty(window, 'matchMedia', {
    writable: true,
    value: vi.fn().mockImplementation((query: string) => ({
      matches: false,
      media: query,
      onchange: null,
      addListener: vi.fn(),
      removeListener: vi.fn(),
      addEventListener: vi.fn(),
      removeEventListener: vi.fn(),
      dispatchEvent: vi.fn(),
    })),
  });
}

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??=
  ResizeObserverStub as unknown as typeof ResizeObserver;

Element.prototype.scrollIntoView ??= () => {};
window.scrollTo = () => {};
window.HTMLElement.prototype.hasPointerCapture ??= () => false;
window.HTMLElement.prototype.releasePointerCapture ??= () => {};
Element.prototype.getAnimations ??= () => [];

/* ── Console: drop jsdom's "navigation not implemented" and the axios
      client's dev-only request log so real failures stay visible. ──────── */

const IGNORED_CONSOLE = [/Not implemented: navigation/, /^\[api\] ✗/];
const originalError = console.error.bind(console);
console.error = (...args: unknown[]) => {
  const first = args[0];
  const text =
    typeof first === 'string'
      ? first
      : first instanceof Error
        ? first.message
        : '';
  if (IGNORED_CONSOLE.some((re) => re.test(text))) {
    return;
  }
  originalError(...args);
};

/* ── Network: every request goes through MSW, unknown ones fail loudly ── */

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(() => {
  server.resetHandlers();
  cleanup();
  resetStores();
  window.localStorage.clear();
  window.sessionStorage.clear();
});

afterAll(() => {
  server.close();
});

/* ── i18n: tests run in English by default; call setTestLanguage('ar')
      inside a test to assert the Arabic/RTL path. ───────────────────── */

beforeAll(async () => {
  await i18n.changeLanguage('en');
});

afterEach(async () => {
  if (i18n.language !== 'en') {
    await i18n.changeLanguage('en');
  }
});
