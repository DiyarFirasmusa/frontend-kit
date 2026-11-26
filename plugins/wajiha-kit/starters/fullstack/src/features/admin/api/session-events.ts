/**
 * The API layer cannot touch the router, so when a session ends (a 401) it announces it here. The admin
 * layout listens and moves to the login page without a full reload. With no listener (tests) nothing happens.
 */
const target = new EventTarget();
const EVENT = 'session-expired';

/** Returns true when a listener handled the event. */
export function emitSessionExpired(): boolean {
  return !target.dispatchEvent(new Event(EVENT, { cancelable: true }));
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
