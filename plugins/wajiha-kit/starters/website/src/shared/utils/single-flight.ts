/**
 * Wraps an async action so a second call while one is still running does nothing.
 * Every submit in the app goes through this: a double tap must never send twice.
 * Returns true when the action ran, false when it was skipped.
 */
export function createSingleFlight(): <T>(action: () => Promise<T>) => Promise<boolean> {
  let busy = false;
  return async (action) => {
    if (busy) {
      return false;
    }
    busy = true;
    try {
      await action();
      return true;
    } finally {
      busy = false;
    }
  };
}
