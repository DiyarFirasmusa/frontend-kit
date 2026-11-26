import { QueryClient, QueryObserver } from '@tanstack/react-query';
import { waitFor } from '@testing-library/react';
import { describe, expect, it } from 'vitest';
import { forgetQueries } from './forget-queries';

const KEY = ['things', 'detail', 'a'] as const;
const OTHER = ['things', 'detail', 'b'] as const;

describe('forgetQueries', () => {
  it('drops unused queries of the given keys and keeps the rest', async () => {
    const qc = new QueryClient();
    qc.setQueryData(KEY, { id: 'a' });
    qc.setQueryData(OTHER, { id: 'b' });

    await forgetQueries(qc, [KEY]);

    expect(qc.getQueryData(KEY)).toBeUndefined();
    expect(qc.getQueryData(OTHER)).toEqual({ id: 'b' });
  });

  it('aborts an in-flight fetch and does not start another', async () => {
    const qc = new QueryClient();
    let calls = 0;
    let aborted = false;
    const started = qc.fetchQuery({
      queryKey: KEY,
      queryFn: ({ signal }) =>
        new Promise<string>((_resolve, reject) => {
          calls += 1;
          signal.addEventListener('abort', () => {
            aborted = true;
            reject(new Error('aborted'));
          });
        }),
    });
    started.catch(() => null);

    await forgetQueries(qc, [KEY]);

    expect(aborted).toBe(true);
    expect(calls).toBe(1);
    expect(qc.getQueryCache().find({ queryKey: KEY })).toBeUndefined();
  });

  it('does not recreate a query a mounted observer is watching', async () => {
    const qc = new QueryClient();
    let calls = 0;
    const observer = new QueryObserver(qc, {
      queryKey: KEY,
      queryFn: () => {
        calls += 1;
        return Promise.resolve('x');
      },
    });
    const unsubscribe = observer.subscribe(() => null);
    await waitFor(() => {
      expect(observer.getCurrentResult().isSuccess).toBe(true);
    });

    await forgetQueries(qc, [KEY]);
    await new Promise<void>((resolve) => {
      setTimeout(resolve, 30);
    });

    expect(calls).toBe(1);
    unsubscribe();
  });
});
