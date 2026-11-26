let started: Promise<void> | undefined;

/**
 * Starts the mock API when the build says so (VITE_ADMIN_API_MOCK=true). The check reads import.meta.env
 * directly, so a build with the mock off drops the import below and never ships MSW. Safe to call many
 * times: the worker starts once per page.
 */
export function startAdminMocks(): Promise<void> {
  if (import.meta.env.VITE_ADMIN_API_MOCK !== 'true') {
    return Promise.resolve();
  }
  started ??= import('./browser').then(async ({ worker }) => {
    await worker.start({
      onUnhandledRequest: 'bypass',
      quiet: true,
      serviceWorker: { url: '/mockServiceWorker.js' },
    });
  });
  return started;
}
