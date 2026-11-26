import { isAxiosError, isCancel } from 'axios';
import type { ToastMessage } from '@/shared/store/toast-store';

/** HTTP status of a failed request, or undefined for a network error or a non-HTTP error. */
export function errorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/** The `message` the backend sent with an error, when it is a non-empty string. */
function backendMessage(error: unknown): string | undefined {
  if (!isAxiosError(error)) {
    return undefined;
  }
  const body: unknown = error.response?.data;
  if (typeof body === 'object' && body !== null && 'message' in body) {
    const { message } = body;
    return typeof message === 'string' && message.trim() !== '' ? message : undefined;
  }
  return undefined;
}

/**
 * What to tell the user about a failed request. The backend's own message wins (the mock API answers
 * in the request's language); otherwise a short text chosen by status.
 */
export function apiErrorMessage(error: unknown): ToastMessage {
  const text = backendMessage(error);
  if (text !== undefined) {
    return { text };
  }
  const status = errorStatus(error);
  if (status === undefined) {
    return { key: 'adminErrors.network' };
  }
  if (status === 403) {
    return { key: 'adminErrors.forbidden' };
  }
  if (status === 404) {
    return { key: 'adminErrors.notFound' };
  }
  if (status === 409) {
    return { key: 'adminErrors.conflict' };
  }
  if (status >= 500) {
    return { key: 'adminErrors.server' };
  }
  return { key: 'adminErrors.generic' };
}

export function isCancelled(error: unknown): boolean {
  return isCancel(error);
}
