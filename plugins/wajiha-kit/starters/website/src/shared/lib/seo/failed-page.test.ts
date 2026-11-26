import { describe, expect, it } from 'vitest';
import { failedMeta, failureOf } from './failed-page';

describe('failureOf', () => {
  it('reads only the public match status', () => {
    expect(failureOf([{ status: 'success' }, { status: 'success' }])).toBeUndefined();
    expect(failureOf([{ status: 'success' }, { status: 'notFound' }])).toBe('notFound');
    expect(failureOf([{ status: 'error' }])).toBe('error');
    expect(failureOf([])).toBeUndefined();
  });

  it('a notFound wins over an error (a missing page is not a server fault)', () => {
    expect(failureOf([{ status: 'error' }, { status: 'notFound' }])).toBe('notFound');
  });

  it('ignores a private marker: a match that is only flagged _notFound is not a failure here', () => {
    expect(
      failureOf([{ status: 'success', _notFound: true } as { status: string }]),
    ).toBeUndefined();
  });
});

describe('failedMeta', () => {
  const t = (key: string) => `T:${key}`;

  it('gives a failed page a title and noindex, and a good page nothing', () => {
    expect(failedMeta(undefined, t)).toEqual([]);
    expect(failedMeta('notFound', t)).toEqual([
      { title: 'T:error.notFoundTitle' },
      { name: 'robots', content: 'noindex, nofollow' },
    ]);
    expect(failedMeta('error', t)[0]).toEqual({ title: 'T:error.errorTitle' });
  });
});
