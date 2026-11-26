/**
 * Tabs of the same app tell each other about token rotation and sign-out over
 * a BroadcastChannel. Without it a tab that waited for the refresh lock would
 * refresh again with a token another tab has just rotated (and revoked), and
 * a sign-out in one tab would leave the others signed in.
 *
 * The channel exists only between startSessionSync() and stopSessionSync()
 * (bootstrapSession starts it), so unit tests that never boot the app have no
 * open channel. Where BroadcastChannel is missing, every call is a no-op.
 */

export type SessionMessage =
  | {
      type: 'refreshed';
      access: string;
      /** The rotated refresh token (session mode); null in cookie mode. */
      refresh: string | null;
      /** The refresh token the sender used, so only tabs on it adopt the result. */
      previousRefresh: string | null;
      /** `sub` of the new token, so a tab signed in as someone else ignores it. */
      userId: string | null;
    }
  | { type: 'signed-out' };

const CHANNEL_NAME = 'app-session';

let channel: BroadcastChannel | null = null;
const listeners = new Set<(message: SessionMessage) => void>();

function isSessionMessage(value: unknown): value is SessionMessage {
  if (!value || typeof value !== 'object' || !('type' in value)) {
    return false;
  }
  return value.type === 'refreshed' || value.type === 'signed-out';
}

export function startSessionSync(): void {
  if (channel || typeof BroadcastChannel === 'undefined') {
    return;
  }
  channel = new BroadcastChannel(CHANNEL_NAME);
  channel.addEventListener('message', (event: MessageEvent<unknown>) => {
    if (!isSessionMessage(event.data)) {
      return;
    }
    for (const listener of listeners) {
      listener(event.data);
    }
  });
}

export function stopSessionSync(): void {
  channel?.close();
  channel = null;
}

/** Sends to the other tabs; a tab never receives its own message. */
export function postSessionMessage(message: SessionMessage): void {
  channel?.postMessage(message);
}

export function onSessionMessage(
  listener: (message: SessionMessage) => void,
): () => void {
  listeners.add(listener);
  return () => {
    listeners.delete(listener);
  };
}
