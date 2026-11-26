import { useMemo, useRef } from 'react';

export interface SingleFlight {
  /** True when this call won the slot; false when a request is already in flight. */
  start: () => boolean;
  /** Frees the slot. Pass it as the mutation's `onSettled`. */
  end: () => void;
}

/**
 * The guard behind "a submit is single-flight". `mutation.isPending` is a
 * render-time value: it stays false until React re-renders after the first
 * `mutate`, so three quick Enters (or a scripted double click) all pass an
 * `isPending` check. A ref flips synchronously. Use it in every submit
 * handler: `if (!flight.start()) return;` then `onSettled: flight.end`.
 */
export function useSingleFlight(): SingleFlight {
  const busy = useRef(false);
  return useMemo(
    () => ({
      start: () => {
        if (busy.current) {
          return false;
        }
        busy.current = true;
        return true;
      },
      end: () => {
        busy.current = false;
      },
    }),
    [],
  );
}
