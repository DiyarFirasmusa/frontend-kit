import { useRouter } from '@tanstack/react-router';
import { useEffect, useState } from 'react';

/**
 * After a client-side page change: moves focus to the new page's <h1> (or <main>) and announces it in a
 * live region. Without this, focus stays on the clicked link and a screen reader says nothing, because
 * the browser does not load a new document. The first page load is left alone.
 */
export function RouteAnnouncer() {
  const router = useRouter();
  const [message, setMessage] = useState('');

  useEffect(
    () =>
      router.subscribe('onRendered', (event) => {
        if (event.fromLocation === undefined || !event.pathChanged) {
          return;
        }
        const main = document.getElementById('main');
        const heading = main?.querySelector('h1') ?? null;
        if (heading !== null) {
          heading.tabIndex = -1;
        }
        (heading ?? main)?.focus({ preventScroll: true });
        setMessage(heading?.textContent ?? document.title);
      }),
    [router],
  );

  return (
    <output aria-live="polite" aria-atomic="true" className="sr-only">
      {message}
    </output>
  );
}
