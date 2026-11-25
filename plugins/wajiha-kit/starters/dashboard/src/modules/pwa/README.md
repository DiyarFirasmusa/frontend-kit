# PWA module (optional, off by default)

Makes the dashboard installable and lets it reopen offline. Everything lives in
`vite/pwa.ts`, `vite/pwa-register-stub.ts` and this folder.

Turn on: set `VITE_PWA=true` in `.env`, then `npm run build && npm run preview`.
Turn off: remove the line. Nothing else changes.

- Manifest name, colours and icons: `vite/pwa.ts` (colours come from the default
  preset in `src/style/tokens`; icons are made by `npm run icons`).
- It caches the built files only. Calls to the API are never cached.
- When a new version is deployed the user sees a toast with a Reload button.
- The service worker is off in `npm run dev` on purpose.
- Stuck on an old version while developing? In the browser: DevTools, Application,
  Service Workers, Unregister, then Clear site data.
