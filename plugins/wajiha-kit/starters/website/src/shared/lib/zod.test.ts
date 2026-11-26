import { describe, expect, it } from 'vitest';
import { z } from './zod';

describe('zod wrapper', () => {
  it('turns the eval fast path off, so the strict CSP sees no violation', () => {
    expect(z.core.globalConfig.jitless).toBe(true);
  });

  it('still validates', () => {
    expect(z.string().min(2).safeParse('a').success).toBe(false);
    expect(z.string().min(2).safeParse('ab').success).toBe(true);
  });
});
