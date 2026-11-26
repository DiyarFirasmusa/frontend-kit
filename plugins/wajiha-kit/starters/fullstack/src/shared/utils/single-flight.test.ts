import { describe, expect, it, vi } from 'vitest';
import { createSingleFlight } from './single-flight';

describe('createSingleFlight', () => {
  it('skips a second call while the first is running', async () => {
    const run = createSingleFlight();
    let release: () => void = () => undefined;
    const action = vi.fn(() => new Promise<void>((resolve) => (release = resolve)));

    const first = run(action);
    const second = await run(action);
    expect(second).toBe(false);
    expect(action).toHaveBeenCalledTimes(1);

    release();
    expect(await first).toBe(true);
  });

  it('allows the next call after the first finished, or failed', async () => {
    const run = createSingleFlight();
    await expect(run(() => Promise.reject(new Error('boom')))).rejects.toThrow('boom');
    expect(await run(() => Promise.resolve(1))).toBe(true);
  });
});
