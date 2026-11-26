import { isAxiosError, isCancel } from 'axios';
import type { ToastMessage } from '@/shared/store/toast-store';
import { parseApiProblem } from './problem';

/** HTTP status of a failed request, or undefined for a network error or a non-HTTP error. */
export function errorStatus(error: unknown): number | undefined {
  return isAxiosError(error) ? error.response?.status : undefined;
}

/**
 * What to tell the user about a failed request. The backend's own sentence wins (the mock API answers in
 * the request's language; Spring bodies: see problem.ts), then the first field error, then a short text
 * chosen by status.
 */
export function apiErrorMessage(error: unknown): ToastMessage {
  const problem = parseApiProblem(error);
  const text = problem.message ?? Object.values(problem.fields)[0];
  if (text !== undefined) {
    return { text };
  }
  const { status } = problem;
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
