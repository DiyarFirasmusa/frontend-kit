/**
 * The API layer cannot touch the router, so when a session ends (401 and the
 * refresh failed) it announces it here. The root route listens and navigates to
 * /login without a full page reload, which keeps the router state. With no
 * listener (tests, a boot error) the caller falls back to a hard redirect.
 */
const target = new EventTarget();
const EVENT = 'session-expired';

/** Returns true when a listener handled the event. */
export function emitSessionExpired(): boolean {
  return target.dispatchEvent(new Event(EVENT, { cancelable: true })) === false;
}

export function onSessionExpired(listener: () => void): () => void {
  const handler = (event: Event): void => {
    event.preventDefault();
    listener();
  };
  target.addEventListener(EVENT, handler);
  return () => {
    target.removeEventListener(EVENT, handler);
  };
}
