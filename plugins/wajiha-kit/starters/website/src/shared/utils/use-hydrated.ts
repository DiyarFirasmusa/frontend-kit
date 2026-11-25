import { useSyncExternalStore } from 'react';

const subscribe = (): (() => void) => () => undefined;

/** False in the server HTML and during hydration, true once React runs in the browser. */
export function useHydrated(): boolean {
  return useSyncExternalStore(
    subscribe,
    () => true,
    () => false,
  );
}
