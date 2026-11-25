import axios, { type AxiosError, type InternalAxiosRequestConfig } from 'axios';
import { refreshAccessToken } from '@/api/auth/refresh-token';
import { emitSessionExpired } from '@/api/auth/session-events';
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

privateApi.interceptors.response.use(
  handleApiResponse,
  async (error: AxiosError) => {
    if (error.config?.skipAuthHandling) {
      throw error;
    }

    if (error.response?.status === 401 && !error.config?.keepSession) {
      const original = error.config as
        | (InternalAxiosRequestConfig & { isRetry?: boolean })
        | undefined;

      if (original && !original.isRetry) {
        original.isRetry = true;
        const newToken = await refreshAccessToken();
        if (newToken) {
          original.headers.Authorization = `Bearer ${newToken}`;
          return privateApi(original);
        }
      }

      useAuthStore.getState().clear();
      // Let the router move to /login; only hard-redirect when nothing is listening.
      if (!emitSessionExpired() && typeof window !== 'undefined') {
        window.location.assign('/login');
      }
      throw error;
    }

    return rejectApiError(error);
  },
);
