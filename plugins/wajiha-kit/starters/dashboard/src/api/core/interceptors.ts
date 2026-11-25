import {
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

export function handleApiResponse(response: AxiosResponse) {
  const body: unknown = response.data;
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
      toast.error(resolveApiErrorMessage(error));
    }
  }
  throw error;
}
