/* Screens for failures that happen before the router, i18n and the API client
   exist. They use no providers and no translations (i18n may not be ready),
   so text that the user must read is written in both languages here. */

/* Invalid configuration is a deploy mistake, not a user error — say so in
   plain text before any of the app (router, i18n, API client) boots. */
export function EnvErrorScreen({ message }: { message: string }) {
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

interface MockApiErrorScreenProps {
  /** The page's own port, for the localhost address to suggest. */
  port: string;
  /** The browser's reason, shown as-is for whoever debugs it. */
  reason: string;
}

/* The demo's mock API runs in a service worker, and browsers allow service
   workers only on https or localhost. Opening the dev server through a LAN
   or Tailscale address over plain http therefore stops it before any page
   can render. */
export function MockApiErrorScreen({ port, reason }: MockApiErrorScreenProps) {
  const localUrl = `http://localhost${port ? `:${port}` : ''}`;
  return (
    <main className="bg-background text-text-primary grid min-h-svh place-items-center p-6">
      <div className="max-w-xl space-y-6">
        <section dir="ltr" lang="en" className="surface-card space-y-3">
          <h1 className="text-h3">The demo API could not start</h1>
          <p className="text-b2 text-text-secondary">
            The mock API runs in a service worker, and the browser allows one
            only on https or on localhost. This page was opened over plain http
            on another address.
          </p>
          <ul className="text-b2 text-text-secondary list-disc space-y-1 ps-5">
            <li>
              Open it at <code dir="ltr">{localUrl}</code> on this computer, or
              serve the dev server over https.
            </li>
            <li>
              Or use a real API: set{' '}
              <code>VITE_USE_MOCK=&quot;false&quot;</code> and{' '}
              <code>VITE_API_BASE_URL</code>, then restart the dev server.
            </li>
          </ul>
        </section>
        <section dir="rtl" lang="ar" className="surface-card space-y-3">
          <h2 className="text-h3">تعذّر تشغيل واجهة البيانات التجريبية</h2>
          <p className="text-b2 text-text-secondary">
            تعمل الواجهة التجريبية داخل Service Worker، ولا يسمح المتصفح به إلا
            عبر https أو على localhost. فُتحت هذه الصفحة عبر http على عنوان آخر.
          </p>
          <ul className="text-b2 text-text-secondary list-disc space-y-1 ps-5">
            <li>
              افتحها على <code dir="ltr">{localUrl}</code> من هذا الجهاز، أو شغّل
              خادم التطوير عبر https.
            </li>
            <li>
              أو استخدم واجهة حقيقية: اضبط{' '}
              <code dir="ltr">VITE_USE_MOCK=&quot;false&quot;</code> و
              <code dir="ltr">VITE_API_BASE_URL</code> ثم أعد تشغيل خادم
              التطوير.
            </li>
          </ul>
        </section>
        <pre
          dir="ltr"
          className="text-b3 overflow-x-auto rounded-xl bg-neutral-50 p-4 font-mono whitespace-pre-wrap"
        >
          {reason}
        </pre>
      </div>
    </main>
  );
}
