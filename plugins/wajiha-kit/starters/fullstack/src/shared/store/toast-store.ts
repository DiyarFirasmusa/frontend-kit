import { create } from 'zustand';

export type ToastTone = 'success' | 'error';

/** A message is an i18n key (translated when shown) or text that is already in the reader's language. */
export type ToastMessage = { key: string } | { text: string };

export type Toast = { id: number; tone: ToastTone; message: ToastMessage };

type ToastState = {
  toasts: Toast[];
  push: (tone: ToastTone, message: ToastMessage) => void;
  dismiss: (id: number) => void;
  clear: () => void;
};

/** How long a toast stays. Long enough to read a sentence; errors stay until dismissed or replaced. */
export const TOAST_MS = 5000;
const MAX_TOASTS = 3;

let nextId = 1;

function sameMessage(a: ToastMessage, b: ToastMessage): boolean {
  return 'key' in a ? 'key' in b && a.key === b.key : 'text' in b && a.text === b.text;
}

/**
 * Toasts without a toast library: the common ones inject a <style> element at runtime, which the
 * strict Content-Security-Policy (style-src 'self') blocks. The Toaster component renders this store.
 */
export const useToastStore = create<ToastState>((set) => ({
  toasts: [],
  push: (tone, message) => {
    set((state) => {
      // One failed request that is retried reports the same error again: show it once, not three times.
      const shown =
        tone === 'error' &&
        state.toasts.some((toast) => toast.tone === 'error' && sameMessage(toast.message, message));
      if (shown) {
        return state;
      }
      const toast: Toast = { id: nextId++, tone, message };
      return { toasts: [...state.toasts, toast].slice(-MAX_TOASTS) };
    });
  },
  dismiss: (id) => {
    set((state) => ({ toasts: state.toasts.filter((toast) => toast.id !== id) }));
  },
  clear: () => {
    set({ toasts: [] });
  },
}));

/** Call from anywhere (event handlers, the API layer): toast.success({ key: 'suppliers.created' }). */
export const toast = {
  success: (message: ToastMessage) => {
    useToastStore.getState().push('success', message);
  },
  error: (message: ToastMessage) => {
    useToastStore.getState().push('error', message);
  },
};
