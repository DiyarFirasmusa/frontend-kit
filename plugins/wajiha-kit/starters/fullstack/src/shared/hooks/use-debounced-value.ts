import { useEffect, useState } from 'react';

/**
 * The value, once it has stayed the same for `delayMs`. An emptied search box is not delayed: clearing a
 * filter shows the full list at once.
 */
export function useDebouncedValue<T>(value: T, delayMs = 400): T {
  const [debounced, setDebounced] = useState(value);

  useEffect(() => {
    const timer = setTimeout(
      () => {
        setDebounced(value);
      },
      value === '' ? 0 : delayMs,
    );
    return () => {
      clearTimeout(timer);
    };
  }, [value, delayMs]);

  return value === '' ? value : debounced;
}
