import {
  create as createAxios,
  isAxiosError,
  type AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { publicEnv } from '@/shared/env/public-env';
import { toast } from '@/shared/store/toast-store';
import { useAuthStore } from '../store/auth-store';
import { apiErrorMessage, isCancelled } from './errors';
import { emitSessionExpired } from './session-events';

declare module 'axios' {
  interface AxiosRequestConfig {
    /** i18n key shown as a success toast after a create, update or delete. */
    successMessage?: string;
    /** No error toast: the caller shows the error itself (for example inside a form). */
    silentError?: boolean;
  }
}

const REQUEST_TIMEOUT_MS = 20_000;

/** The page language (<html lang>), sent so the backend answers in it. */
function pageLanguage(): string {
  return typeof document === 'undefined' ? 'ar' : document.documentElement.lang || 'ar';
}

function prepare(config: InternalAxiosRequestConfig): InternalAxiosRequestConfig {
  config.headers['Accept-Language'] = pageLanguage();
  config.headers.Accept = 'application/json';
  return config;
}

function onSuccess(response: AxiosResponse): AxiosResponse {
  const method = response.config.method?.toLowerCase() ?? 'get';
  const { successMessage } = response.config;
  if (method !== 'get' && successMessage !== undefined) {
    toast.success({ key: successMessage });
  }
  return response;
}

function onError(error: unknown): never {
  if (!isCancelled(error) && !(isAxiosError(error) && error.config?.silentError === true)) {
    toast.error(apiErrorMessage(error));
  }
  throw error;
}

function create() {
  return createAxios({
    baseURL: publicEnv.VITE_ADMIN_API_URL,
    timeout: REQUEST_TIMEOUT_MS,
    headers: { 'Content-Type': 'application/json' },
  });
}

/** Requests that need no session (login). */
export const publicApi = create();
publicApi.interceptors.request.use(prepare);
publicApi.interceptors.response.use(onSuccess, onError);

/** Requests made by a signed-in user: the bearer token is added, a 401 ends the session. */
export const privateApi = create();
privateApi.interceptors.request.use((config) => {
  prepare(config);
  const token = useAuthStore.getState().accessToken;
  if (token !== null) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});
privateApi.interceptors.response.use(onSuccess, (error: AxiosError) => {
  if (error.response?.status === 401) {
    useAuthStore.getState().clear();
    emitSessionExpired();
    throw error;
  }
  return onError(error);
});
