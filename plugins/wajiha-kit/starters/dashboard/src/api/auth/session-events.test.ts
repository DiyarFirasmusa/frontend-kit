import { describe, expect, it, vi } from 'vitest';
import { emitSessionExpired, onSessionExpired } from './session-events';

describe('session events', () => {
  it('reports false when nobody listens', () => {
    expect(emitSessionExpired()).toBe(false);
  });

  it('calls a listener and reports it handled the event', () => {
    const listener = vi.fn();
    const stop = onSessionExpired(listener);
    expect(emitSessionExpired()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
    stop();
    expect(emitSessionExpired()).toBe(false);
  });
});
