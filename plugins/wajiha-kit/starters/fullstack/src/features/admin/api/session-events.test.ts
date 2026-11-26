import { afterEach, describe, expect, it, vi } from 'vitest';
import { emitSessionExpired, forgetMissedSessionExpiry, onSessionExpired } from './session-events';

const stops: (() => void)[] = [];
function listen(listener: () => void): void {
  stops.push(onSessionExpired(listener));
}

afterEach(() => {
  for (const stop of stops.splice(0)) {
    stop();
  }
  forgetMissedSessionExpiry();
});

describe('session expiry events', () => {
  it('tells a listener that is already subscribed, and says it was handled', () => {
    const listener = vi.fn();
    listen(listener);
    expect(emitSessionExpired()).toBe(true);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('keeps an expiry nobody heard and hands it to the first listener that subscribes', () => {
    expect(emitSessionExpired()).toBe(false);
    const listener = vi.fn();
    listen(listener);
    expect(listener).toHaveBeenCalledTimes(1);
  });

  it('hands a missed expiry over once, not to every later subscriber', () => {
    emitSessionExpired();
    const first = vi.fn();
    const second = vi.fn();
    listen(first);
    listen(second);
    expect(first).toHaveBeenCalledTimes(1);
    expect(second).not.toHaveBeenCalled();
  });

  it('does not replay an expiry that a listener already handled', () => {
    const first = vi.fn();
    const stop = onSessionExpired(first);
    emitSessionExpired();
    stop();
    const later = vi.fn();
    listen(later);
    expect(first).toHaveBeenCalledTimes(1);
    expect(later).not.toHaveBeenCalled();
  });

  it('forgets a missed expiry on request', () => {
    emitSessionExpired();
    forgetMissedSessionExpiry();
    const listener = vi.fn();
    listen(listener);
    expect(listener).not.toHaveBeenCalled();
  });

  it('stops telling a listener after it unsubscribed', () => {
    const listener = vi.fn();
    const stop = onSessionExpired(listener);
    stop();
    expect(emitSessionExpired()).toBe(false);
    expect(listener).not.toHaveBeenCalled();
  });
});
