import axios, {
  AxiosError,
  type AxiosResponse,
  type InternalAxiosRequestConfig,
} from 'axios';
import { refreshAccessToken } from '@/api/auth/refresh-token';
import { expireSession, notifyForbidden } from '@/api/auth/session-hooks';
import { useAuthStore } from '@/store/auth-store';
import { apiConfig } from '../../core/config';
import {
  handleApiResponse,
  prepareApiRequest,
  rejectApiError,
} from '../../core/interceptors';

export const privateApi = axios.create(apiConfig);

privateApi.interceptors.request.use(
  (config: InternalAxiosRequestConfig) => {
    prepareApiRequest(config);
    const token = useAuthStore.getState().accessToken;
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error: AxiosError) => Promise.reject(error),
);

function bearerOf(config: InternalAxiosRequestConfig): string | null {
  const header = config.headers.Authorization;
  return typeof header === 'string' && header.startsWith('Bearer ')
    ? header.slice('Bearer '.length)
    : null;
}

/**
 * The refresh server could not be reached: fail this request the way any
 * network failure fails (toast, or the offline page for a read), and keep
 * the session so a blip does not throw away unsaved work.
 */
function asNetworkError(error: AxiosError): AxiosError {
  return new AxiosError(
    'Network Error',
    AxiosError.ERR_NETWORK,
    error.config,
    error.request,
  );
}

async function handleUnauthorized(error: AxiosError): Promise<AxiosResponse> {
  const original = error.config;
  const sessionId = useAuthStore.getState().sessionId;
  if (!original || original.isRetry) {
    expireSession(sessionId);
    throw error;
  }
  original.isRetry = true;
  const result = await refreshAccessToken(bearerOf(original));
  // Signed out, expired by a concurrent request, or a different account
  // signed in while this one waited: nothing to retry and nothing to end.
  if (useAuthStore.getState().sessionId !== sessionId) {
    throw error;
  }
  if (result.status === 'ok') {
    original.headers.Authorization = `Bearer ${result.token}`;
    return privateApi(original);
  }
  if (result.status === 'unavailable') {
    return rejectApiError(asNetworkError(error));
  }
  expireSession(sessionId);
  throw error;
}

privateApi.interceptors.response.use(
  handleApiResponse,
  async (error: AxiosError) => {
    if (error.config?.skipAuthHandling) {
      throw error;
    }
    const status = error.response?.status;
    if (status === 401 && !error.config?.keepSession) {
      return handleUnauthorized(error);
    }
    if (status === 403) {
      notifyForbidden();
    }
    return rejectApiError(error);
  },
);
