import '@testing-library/jest-dom/vitest';
import { cleanup } from '@testing-library/react';
import { afterAll, afterEach, beforeAll, vi } from 'vitest';
import { forgetMissedSessionExpiry } from '@/features/admin/api/session-events';
import { resetMockDb } from '@/features/admin/mocks/db';
import { useAuthStore } from '@/features/admin/store/auth-store';
import { useToastStore } from '@/shared/store/toast-store';
import { testI18n } from './i18n';
import { server } from './msw-server';

// ── DOM APIs jsdom does not implement ───────────────────────────────────────

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

class ResizeObserverStub {
  observe() {}
  unobserve() {}
  disconnect() {}
}
globalThis.ResizeObserver ??= ResizeObserverStub as unknown as typeof ResizeObserver;
Element.prototype.scrollIntoView ??= () => {};
window.scrollTo = () => {};
window.HTMLElement.prototype.hasPointerCapture ??= () => false;
window.HTMLElement.prototype.releasePointerCapture ??= () => {};
Element.prototype.getAnimations ??= () => [];

// ── Network: the admin's mock API answers every admin request; anything else fails loudly ──

beforeAll(() => {
  server.listen({ onUnhandledRequest: 'error' });
});

afterEach(async () => {
  cleanup();
  server.resetHandlers();
  resetMockDb();
  forgetMissedSessionExpiry();
  useToastStore.getState().clear();
  vi.restoreAllMocks();
  useAuthStore.getState().clear();
  window.sessionStorage.clear();
  window.localStorage.clear();
  if (testI18n.language !== 'en') {
    await testI18n.changeLanguage('en');
  }
});

afterAll(() => {
  server.close();
});
