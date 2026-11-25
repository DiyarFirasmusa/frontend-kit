import { create } from 'zustand';

export type AppErrorKind = 'network' | 'server';

export interface AppError {
  kind: AppErrorKind;
  status: number | null;
  method: string;
  path: string;
  correlationId: string | null;
  occurredAt: string;
}

interface AppErrorState {
  error: AppError | null;
  setError: (error: AppError) => void;
  clear: () => void;
}

/**
 * The page-level failure the dashboard shell shows instead of the current
 * page: lost connectivity, or a server error while loading page data. Set by
 * the API error interceptor, cleared by retry, by coming back online or by
 * navigating away. Ephemeral — never persisted.
 */
export const useAppErrorStore = create<AppErrorState>()((set) => ({
  error: null,
  setError: (error) => {
    set({ error });
  },
  clear: () => {
    set({ error: null });
  },
}));
