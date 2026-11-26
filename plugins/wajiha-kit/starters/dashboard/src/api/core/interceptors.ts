import {
  AxiosError,
  isAxiosError,
  isCancel,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { toast } from 'sonner';
import { env } from '@/env';
import { useAppErrorStore } from '@/store/app-error-store';
import {
  displayBackendMessage,
  extractApiErrorMessage,
  resolveApiErrorMessage,
} from '../error/api-error';
import { toAppError } from '../error/utils/classify';
import {
  DEFAULT_REQUEST_TIMEOUT_MS,
  FILE_TRANSFER_TIMEOUT_MS,
  getLanguage,
} from './config';

export function prepareApiRequest(config: InternalAxiosRequestConfig) {
  if (config.authBase === true) {
    config.baseURL = env.VITE_AUTH_BASE_URL;
    delete config.authBase;
  }
  config.headers['Accept-Language'] = getLanguage();
  const isFileTransfer =
    config.data instanceof FormData ||
    config.responseType === 'blob' ||
    config.responseType === 'arraybuffer';
  if (config.responseType !== 'blob' && config.responseType !== 'arraybuffer') {
    config.headers.Accept = 'application/json';
  }
  if (config.data instanceof FormData) {
    config.headers.delete('Content-Type');
  }
  // Uploads/downloads legitimately take longer than the default request
  // budget — give them more room, unless the caller already set a
  // different timeout explicitly (the instance default is the only value
  // a request interceptor can tell apart from "not customized").
  if (isFileTransfer && config.timeout === DEFAULT_REQUEST_TIMEOUT_MS) {
    config.timeout = FILE_TRANSFER_TIMEOUT_MS;
  }
  return config;
}

function isFailedEnvelope(body: unknown): boolean {
  return (
    !!body &&
    typeof body === 'object' &&
    'success' in body &&
    body.success === false
  );
}

/**
 * A `{ success: false }` body arrives with a 2xx status. Turn it into the
 * same rejected AxiosError an HTTP error would be, so it toasts once and the
 * caller's `onError` runs instead of reading `null` as data.
 */
function rejectFailedEnvelope(response: AxiosResponse): never {
  const error = new AxiosError(
    extractApiErrorMessage(response.data) ?? 'Request failed',
    AxiosError.ERR_BAD_RESPONSE,
    response.config,
    response.request,
    response,
  );
  return rejectApiError(error);
}

export function handleApiResponse(response: AxiosResponse) {
  const body: unknown = response.data;
  if (isFailedEnvelope(body)) {
    return rejectFailedEnvelope(response);
  }
  const method = response.config.method?.toLowerCase();
  const isMutation = !!method && !['get', 'head', 'options'].includes(method);
  if (isMutation && !response.config.silent) {
    const backendMessage =
      body && typeof body === 'object' && 'message' in body
        ? body.message
        : undefined;
    const message =
      displayBackendMessage(backendMessage) ??
      displayBackendMessage(response.config.successMessage);
    if (message) {
      toast.success(message);
    }
  }
  if (body && typeof body === 'object' && 'success' in body && 'data' in body) {
    response.data = body.data;
  }
  return response;
}

export function rejectApiError(error: unknown): never {
  if (!isCancel(error)) {
    if (isAxiosError(error) && import.meta.env.DEV) {
      const url = `${error.config?.baseURL ?? ''}${error.config?.url ?? ''}`;
      const method = error.config?.method?.toUpperCase() ?? 'GET';
      console.error(
        `[api] ✗ ${error.response?.status ?? 'NETWORK'} ${method} ${url}`,
        error.response?.data ?? error.message,
      );
    }
    const appError = toAppError(error);
    if (appError) {
      useAppErrorStore.getState().setError(appError);
    } else if (
      !isAxiosError(error) ||
      (!error.config?.silentError &&
        !error.config?.silentErrorStatuses?.includes(
          error.response?.status ?? 0,
        ))
    ) {
      // The message is the toast id: a retried request that fails again
      // updates the toast already on screen instead of stacking a second one.
      const message = resolveApiErrorMessage(error);
      toast.error(message, { id: message });
    }
  }
  throw error;
}
