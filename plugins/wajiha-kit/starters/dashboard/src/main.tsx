import { RouterProvider } from '@tanstack/react-router';
import { StrictMode, type ReactNode } from 'react';
import { createRoot, type Root, type RootOptions } from 'react-dom/client';
import { envError } from '@/env';
import { bootstrapSession } from '@/features/auth/session/bootstrap-session';
import { installSessionHooks } from '@/features/auth/session/session-hooks';
import {
  EnvErrorScreen,
  MockApiErrorScreen,
} from '@/features/fallback/boot-error-screens';
import { reportError, startMonitoring } from '@/lib/monitoring';
import { registerServiceWorker } from '@/modules/pwa/register';
import { getRouter } from './router';
import '@/style/fonts';
import '@/style/styles.css';

const rootEl = document.querySelector('#root');

if (!rootEl) {
  throw new Error('Root element #root not found in index.html');
}

/* Render errors caught by a boundary are reported by the router's boundaries
   (onCatch on the root, _app and _auth routes); reporting them here as well
   would send each one twice. Only what no boundary caught comes through here.
   Recoverable errors are kept: React fixed them by re-rendering, so no
   boundary ever sees them, and they still point at a real bug. */
function reportRootError(boundary: 'uncaught' | 'recoverable') {
  return (error: unknown, info: { componentStack?: string | null }) => {
    void reportError(error, { boundary, componentStack: info.componentStack });
  };
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

function renderScreen(container: Element, screen: ReactNode): void {
  getRoot(container).render(<StrictMode>{screen}</StrictMode>);
}

/* Playground: the mock API (src/mocks) answers every request in the browser,
   so the app runs with no backend. Turned on by VITE_USE_MOCK in .env.development.
   'warn' makes an endpoint without a mock handler visible in the console
   instead of silently going to the fake base URL. Resolves with the error
   when the service worker could not start. */
async function startMockApi(): Promise<Error | null> {
  if (import.meta.env.VITE_USE_MOCK !== 'true') {
    return null;
  }
  try {
    const { worker } = await import('./mocks/browser');
    await worker.start({ onUnhandledRequest: 'warn', quiet: true });
    return null;
  } catch (error) {
    return error instanceof Error ? error : new Error(String(error));
  }
}

async function start(container: Element): Promise<void> {
  if (envError) {
    renderScreen(container, <EnvErrorScreen message={envError} />);
    return;
  }
  const mockError = await startMockApi();
  if (mockError) {
    renderScreen(
      container,
      <MockApiErrorScreen
        port={window.location.port}
        reason={mockError.message}
      />,
    );
    return;
  }
  registerServiceWorker();

  const router = getRouter();
  startMonitoring(router);
  installSessionHooks({ router });
  // The access token lives in memory: restore it (and the permissions)
  // before the first guard runs, or a reload would land on /login.
  await bootstrapSession();

  getRoot(container, {
    onUncaughtError: reportRootError('uncaught'),
    onRecoverableError: reportRootError('recoverable'),
  }).render(
    <StrictMode>
      <RouterProvider router={router} />
    </StrictMode>,
  );
}

await start(rootEl);
