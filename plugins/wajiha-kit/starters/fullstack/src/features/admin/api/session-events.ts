/**
 * The API layer cannot touch the router, so when a session ends (a 401) it announces it here. The admin
 * layout listens and moves to the login page without a full reload.
 *
 * A 401 can arrive BEFORE anyone listens: on a hard reload the route loader starts its prefetch, and its
 * 401 can come back before the layout (AdminRoot) has mounted and subscribed. An event with no listener is
 * therefore kept, once, and handed to the first listener that subscribes; without that the session would be
 * cleared and the user left on a dead page with no way to the login page.
 */
const target = new EventTarget();
const EVENT = 'session-expired';

/** True when an event was announced while nobody listened and no listener has had it yet. */
let missed = false;

/** Returns true when a listener handled the event (false: it is kept for the next listener). */
export function emitSessionExpired(): boolean {
  const handled = !target.dispatchEvent(new Event(EVENT, { cancelable: true }));
  missed = !handled;
  return handled;
}

/** Subscribes. An expiry announced before this call is delivered at once, one time. */
export function onSessionExpired(listener: () => void): () => void {
  const handler = (event: Event): void => {
    event.preventDefault();
    listener();
  };
  target.addEventListener(EVENT, handler);
  if (missed) {
    missed = false;
    listener();
  }
  return () => {
    target.removeEventListener(EVENT, handler);
  };
}

/** Forgets an expiry nobody heard (tests call it between cases; the browser never needs it). */
export function forgetMissedSessionExpiry(): void {
  missed = false;
}
