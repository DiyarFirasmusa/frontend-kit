/// <reference types="vite/client" />

interface ImportMetaEnv {
  /** development | staging | production | test */
  readonly VITE_ENV?: string;
  /** Absolute base URL of the backend API (required). */
  readonly VITE_API_BASE_URL?: string;
  /** Absolute base URL of the auth service. Empty = same as VITE_API_BASE_URL. */
  readonly VITE_AUTH_BASE_URL?: string;
  /** Sentry DSN — leave empty to disable error monitoring. */
  readonly VITE_SENTRY_DSN?: string;
  /** Injected by vite.config.ts from package.json. */
  readonly VITE_APP_VERSION?: string;
  readonly VITE_APP_NAME?: string;
  /** "true" turns the optional PWA module on (see src/modules/pwa/README.md). */
  readonly VITE_PWA?: string;
  /** "true" starts the in-browser mock API (src/mocks), so the app runs with demo data and no backend. */
  readonly VITE_USE_MOCK?: string;
}
