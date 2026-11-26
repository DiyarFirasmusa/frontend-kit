import { useEffect, useRef } from 'react';

/** True for Ctrl+K, or Cmd+K on Apple keyboards. */
export function isSearchShortcut(event: KeyboardEvent): boolean {
  return (
    (event.metaKey || event.ctrlKey) &&
    !event.altKey &&
    event.key.toLowerCase() === 'k'
  );
}

/**
 * Runs `onTrigger` on Ctrl/Cmd+K anywhere on the page. The top bar decides
 * what that means: focus the field when it is on screen, open the search
 * dialog when it is not.
 */
export function useSearchShortcut(onTrigger: () => void): void {
  const latest = useRef(onTrigger);
  useEffect(() => {
    latest.current = onTrigger;
  });

  useEffect(() => {
    function handle(event: KeyboardEvent) {
      if (isSearchShortcut(event)) {
        event.preventDefault();
        latest.current();
      }
    }
    document.addEventListener('keydown', handle);
    return () => {
      document.removeEventListener('keydown', handle);
    };
  }, []);
}
