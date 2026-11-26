import { useCallback, useSyncExternalStore } from 'react';

/**
 * Whether a media query matches, kept in sync with resizes. Used where CSS
 * alone cannot hide something: items inside a menu still take part in its
 * arrow-key order when they are only `display: none`.
 */
export function useMediaQuery(query: string): boolean {
  const subscribe = useCallback(
    (onChange: () => void) => {
      const list = window.matchMedia(query);
      list.addEventListener('change', onChange);
      return () => {
        list.removeEventListener('change', onChange);
      };
    },
    [query],
  );
  return useSyncExternalStore(
    subscribe,
    () => window.matchMedia(query).matches,
    () => false,
  );
}

/** Below this width the top bar shows a search button instead of the field. */
export const INLINE_SEARCH_QUERY = '(min-width: 1100px)';

/** The phone layout: one bar, theme and language move into the account menu. */
export const PHONE_QUERY = '(max-width: 767.98px)';
