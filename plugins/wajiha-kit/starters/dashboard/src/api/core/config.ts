import type { AxiosRequestConfig } from 'axios';
import { env } from '@/env';
import { LANG_COOKIE } from '@/lib/i18n/i18n';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** Skip the automatic success toast. Errors still use shared feedback. */
    silent?: boolean;
    /** Suppress error feedback for background or best-effort requests. */
    silentError?: boolean;
    silentErrorStatuses?: readonly number[];
    /** Success message fallback when the backend returns no message. */
    successMessage?: string;
    /** Skip session refresh/redirect and error feedback (best-effort logout). */
    skipAuthHandling?: boolean;
    /** On 401, report the error without refreshing or clearing the session (e.g. a wrong old password). */
    keepSession?: boolean;
    /** Route to the auth service base (env.VITE_AUTH_BASE_URL). Removed before axios runs. */
    authBase?: boolean;
    /** Set by the private client on the one retry after a refresh; never set by callers. */
    isRetry?: boolean;
  }
}

export interface ApiFeedbackOptions {
  silent?: boolean;
  successMessage?: string;
}

const API_BASE_URL: string = env.VITE_API_BASE_URL;

/** Default request timeout for ordinary JSON requests. */
export const DEFAULT_REQUEST_TIMEOUT_MS = 20_000;
/** Longer timeout for uploads/downloads (FormData bodies, blob responses). */
export const FILE_TRANSFER_TIMEOUT_MS = 60_000;

export function getLanguage(): string {
  if (typeof document === 'undefined') {
    return 'ar';
  }
  const match = document.cookie.match(
    new RegExp('(?:^|;\\s*)' + LANG_COOKIE + '=([^;]+)'),
  );
  return match?.[1] || 'ar';
}

const baseHeaders = {
  'Content-Type': 'application/json',
};

export const apiConfig: AxiosRequestConfig = {
  baseURL: API_BASE_URL,
  headers: baseHeaders,
  timeout: DEFAULT_REQUEST_TIMEOUT_MS,
  paramsSerializer: { indexes: null },
};
