let started: Promise<void> | undefined;

const WORKER_URL = '/mockServiceWorker.js';

/**
 * Starts the mock API when the build says so (VITE_ADMIN_API_MOCK=true). The check reads import.meta.env
 * directly, so a build with the mock off drops the import below and never ships MSW. Safe to call many
 * times: the worker starts once per page.
 *
 * With the mock off it does the opposite: a visitor who once opened a mock build on this same origin
 * still has the mock service worker registered, and it would keep answering /api. It is removed here.
 */
export function startAdminMocks(): Promise<void> {
  if (import.meta.env.VITE_ADMIN_API_MOCK !== 'true') {
    return forgetMockWorker();
  }
  started ??= import('./browser').then(async ({ worker }) => {
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
      serviceWorker: { url: WORKER_URL },
    });
  });
  return started;
}

async function forgetMockWorker(): Promise<void> {
  if (typeof navigator === 'undefined' || !('serviceWorker' in navigator)) {
    return;
  }
  try {
    const registrations = await navigator.serviceWorker.getRegistrations();
    await Promise.all(
      registrations
        .filter((registration) => registration.active?.scriptURL.endsWith(WORKER_URL) === true)
        .map((registration) => registration.unregister()),
    );
  } catch {
    // Service workers can be blocked (private windows): nothing to remove then.
  }
}
