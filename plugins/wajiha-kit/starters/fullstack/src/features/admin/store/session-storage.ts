import { createJSONStorage, type PersistStorage } from 'zustand/middleware';

/**
 * Bump when the stored shape of EITHER session store changes. A store saved under another version (or
 * under none: older starters wrote no version) is not migrated: it is erased, and the user signs in again.
 */
export const SESSION_STORE_VERSION = 1;

/** The two sessionStorage keys of the admin session (auth-store, permission-store). */
export const SESSION_KEYS = ['admin-auth', 'admin-permissions'] as const;

function read(key: string): string | null {
  try {
    return sessionStorage.getItem(key);
  } catch {
    return null;
  }
}

/** The stored text is a JSON object saved by the current version. */
function isCurrent(raw: string): boolean {
  try {
    const value: unknown = JSON.parse(raw);
    return (
      typeof value === 'object' &&
      value !== null &&
      'version' in value &&
      value.version === SESSION_STORE_VERSION
    );
  } catch {
    return false;
  }
}

function eraseSession(): void {
  try {
    for (const key of SESSION_KEYS) {
      sessionStorage.removeItem(key);
    }
  } catch {
    // Storage is blocked: there is nothing stored to erase.
  }
}

/**
 * Keeps the halves of the session in step. Both are saved together by startSession, so one without the other,
 * or either one saved by another version, means a session that cannot be trusted: erase BOTH (the old token
 * with them) instead of staying "signed in" without rights, and ask the stores to start empty, with no
 * console error ("couldn't be migrated") and nothing left in sessionStorage.
 */
function sessionIsUsable(): boolean {
  const stored = SESSION_KEYS.map(read);
  if (stored.every((raw) => raw === null)) {
    return true;
  }
  return stored.every((raw) => raw !== null && isCurrent(raw));
}

/** The persist storage of both session stores (sessionStorage: closing the tab ends the session). */
export function sessionPersistStorage<S>(): PersistStorage<S> | undefined {
  return createJSONStorage<S>(() => {
    if (typeof sessionStorage === 'undefined') {
      // A node test or the server: createJSONStorage turns this into "no persistence".
      throw new Error('no sessionStorage here');
    }
    return {
      getItem: (name) => {
        if (!sessionIsUsable()) {
          eraseSession();
          return null;
        }
        return read(name);
      },
      setItem: (name, value) => {
        sessionStorage.setItem(name, value);
      },
      removeItem: (name) => {
        sessionStorage.removeItem(name);
      },
    };
  });
}
