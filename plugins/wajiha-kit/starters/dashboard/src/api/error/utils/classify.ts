import { isAxiosError, isCancel } from 'axios';
import type { AppError } from '@/store/app-error-store';

export type ErrorKind = 'network' | 'server' | 'unexpected';

/** True when the request never got an HTTP response (offline, DNS, CORS, timeout). */
export function isNetworkError(error: unknown): boolean {
  return isAxiosError(error) && !isCancel(error) && !error.response;
}

/** True for an HTTP 5xx response. */
export function isServerError(error: unknown): boolean {
  const status = isAxiosError(error) ? error.response?.status : undefined;
  return status !== undefined && status >= 500;
}

const CHUNK_LOAD_PATTERN =
  /dynamically imported module|importing a module script|loading chunk|loading css chunk|failed to fetch|networkerror when attempting/i;

/** True when a lazy route chunk or fetch failed to load, as happens offline. */
function isLoadFailure(error: unknown): boolean {
  return error instanceof Error && CHUNK_LOAD_PATTERN.test(error.message);
}

/**
 * Which error page fits a thrown or rejected value. A device that is offline,
 * or a script/chunk that failed to load, always reads as a network problem.
 */
export function classifyError(error: unknown): ErrorKind {
  if (typeof navigator !== 'undefined' && !navigator.onLine) {
    return 'network';
  }
  if (isNetworkError(error) || isLoadFailure(error)) {
    return 'network';
  }
  if (isServerError(error)) {
    return 'server';
  }
  return 'unexpected';
}

export interface ErrorRequestInfo {
  status: number | null;
  method?: string;
  path?: string;
  correlationId: string | null;
}

/** Status, request line and correlation id of a failed request, if any. */
export function getErrorRequestInfo(error: unknown): ErrorRequestInfo {
  if (!isAxiosError(error)) {
    return { status: null, correlationId: null };
  }
  return {
    status: error.response?.status ?? null,
    method: error.config?.method?.toUpperCase(),
    path: error.config?.url,
    correlationId: readCorrelationId(error),
  };
}

function readCorrelationId(error: unknown): string | null {
  if (!isAxiosError(error)) {
    return null;
  }
  const value: unknown = error.response?.headers['x-correlation-id'];
  return typeof value === 'string' && value !== '' ? value : null;
}

/**
 * Page-level error details for a failed request, or null when the failure
 * belongs inline (4xx, 5xx, cancellation, mutations, silenced background
 * calls). Only losing the network takes over the page.
 * Only reads (GET) take over the page: a failed save keeps the user's form
 * and reports through the toast instead.
 */
export function toAppError(error: unknown, now = new Date()): AppError | null {
  if (!isAxiosError(error) || isCancel(error) || error.config?.silentError) {
    return null;
  }
  if (
    error.config?.silentErrorStatuses?.includes(error.response?.status ?? 0)
  ) {
    return null;
  }
  const method = (error.config?.method ?? 'get').toUpperCase();
  if (method !== 'GET') {
    return null;
  }
  const kind = classifyError(error);
  if (kind !== 'network') {
    return null;
  }
  return {
    kind,
    status: error.response?.status ?? null,
    method,
    path: error.config?.url ?? '',
    correlationId: readCorrelationId(error),
    occurredAt: now.toISOString(),
  };
}
