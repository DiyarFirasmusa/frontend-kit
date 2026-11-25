import { RouterProvider } from '@tanstack/react-router';
import { StrictMode } from 'react';
import { createRoot, type Root, type RootOptions } from 'react-dom/client';
import { envError } from '@/env';
import { configureMonitoring, reportError } from '@/lib/monitoring';
import { registerServiceWorker } from '@/modules/pwa/register';
import { getRouter } from './router';
import '@/style/fonts';
import '@/style/styles.css';

const rootEl = document.querySelector('#root');

if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

/* Invalid configuration is a deploy mistake, not a user error — say so in
   plain text before any of the app (router, i18n, API client) boots. */
function EnvErrorScreen({ message }: { message: string }) {
  return (
    <main
      dir="ltr"
      className="bg-background text-text-primary grid min-h-svh place-items-center p-6"
    >
      <div className="surface-card max-w-xl space-y-4">
        <h1 className="text-h3">Configuration error</h1>
        <p className="text-b2 text-text-secondary">
          The app cannot start because required environment variables are
          missing or invalid. Fix the values below in <code>.env</code> (or the
          build arguments) and rebuild.
        </p>
        <pre className="text-b3 overflow-x-auto rounded-xl bg-neutral-50 p-4 font-mono whitespace-pre-wrap">
          {message}
        </pre>
      </div>
    </main>
  );
}

function reportRenderError(
  error: unknown,
  info: { componentStack?: string | null },
): void {
  void reportError(error, {
    boundary: 'react',
    componentStack: info.componentStack,
  });
}

/* Hot reload can re-run this module; reusing the root it created keeps a
   second createRoot from mounting a duplicate app into #root. */
function getRoot(container: Element, options?: RootOptions): Root {
  const existing = import.meta.hot?.data.root as Root | undefined;
  if (existing) {
    return existing;
  }
  const root = createRoot(container, options);
  if (import.meta.hot) {
    import.meta.hot.data.root = root;
  }
  return root;
}

/* Playground: the mock API (src/mocks) answers every request in the browser,
   so the app runs with no backend. Turned on by VITE_USE_MOCK in .env.development. */
async function startMockApi(): Promise<void> {
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    return;
  }
  const { worker } = await import('./mocks/browser');
  await worker.start({ onUnhandledRequest: 'bypass', quiet: true });
}

await startMockApi();
registerServiceWorker();

if (envError) {
  getRoot(rootEl).render(
    <StrictMode>
      <EnvErrorScreen message={envError} />
    </StrictMode>,
  );
} else {
  const router = getRouter();
  configureMonitoring(router);

  getRoot(rootEl, {
    onCaughtError: reportRenderError,
    onUncaughtError: reportRenderError,
    onRecoverableError: reportRenderError,
  }).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}
