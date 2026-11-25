import type * as SentryType from '@sentry/react';
import { createRootRoute, createRouter } from '@tanstack/react-router';
import { http, HttpResponse } from 'msw';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { server } from '@/test/msw/server';

let sdk: typeof SentryType | undefined;
const events: Record<string, unknown>[] = [];

beforeEach(() => {
  vi.resetModules();
  vi.stubEnv('VITE_SENTRY_DSN', 'http://public@api.test/1');
  events.length = 0;
  server.use(
    http.post('http://api.test/api/1/envelope/', async ({ request }) => {
      const lines = (await request.text()).split('\n');
      const header = JSON.parse(lines[1] ?? '{}') as { type?: string };
      if (header.type === 'event') {
        events.push(JSON.parse(lines[2] ?? '{}') as Record<string, unknown>);
      }
      return HttpResponse.json({});
    }),
  );
});

afterEach(async () => {
  await sdk?.getClient()?.close();
  sdk = undefined;
  vi.unstubAllEnvs();
});

async function load() {
  const monitoring = await import('./monitoring');
  sdk = await import('@sentry/react');
  return { monitoring, sentry: sdk };
}

describe('on-demand monitoring', () => {
  it('does not initialize on configuration, then captures the first error', async () => {
    const { monitoring, sentry } = await load();
    const previousClient = sentry.getClient();
    monitoring.configureMonitoring(
      createRouter({ routeTree: createRootRoute() }),
    );
    expect(sentry.getClient()).toBe(previousClient);
    const error = new Error('First deferred error');
    await monitoring.reportError(error, { boundary: 'root' });
    expect(sentry.getClient()).not.toBe(previousClient);
    await sentry.flush(2000);
    expect(events).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ extra: { boundary: 'root' } }),
      ]),
    );
  });

  it('initializes once for concurrent errors and reports both', async () => {
    const { monitoring, sentry } = await load();
    const previousClient = sentry.getClient();
    await Promise.all([
      monitoring.reportError(new Error('Concurrent first')),
      monitoring.reportError(new Error('Concurrent second')),
    ]);
    const reporter = await monitoring.initSentry();
    expect(await monitoring.initSentry()).toBe(reporter);
    expect(sentry.getClient()).not.toBe(previousClient);
    await sentry.flush(2000);
    expect(events).toHaveLength(2);
  });

  it.each([false, true])(
    'does nothing when the DSN is absent (PROD=%s)',
    async (production) => {
      vi.stubEnv('PROD', production);
      vi.stubEnv('VITE_SENTRY_DSN', '');
      const { monitoring, sentry } = await load();
      const previousClient = sentry.getClient();
      await monitoring.reportError(new Error('Disabled monitoring'));
      expect(await monitoring.initSentry()).toBeNull();
      expect(sentry.getClient()).toBe(previousClient);
      expect(events).toEqual([]);
    },
  );

  it('keeps PII disabled and strips both authorization header variants', async () => {
    const { monitoring, sentry } = await load();
    await monitoring.initSentry();
    const options = sentry.getClient()?.getOptions();
    expect(options?.sendDefaultPii).toBe(false);
    const event = {
      type: undefined,
      request: {
        headers: {
          Authorization: 'secret',
          authorization: 'secret',
          Accept: 'application/json',
        },
      },
    };
    expect(await options?.beforeSend?.(event, {})).toMatchObject({
      request: { headers: { Accept: 'application/json' } },
    });
    expect(event.request.headers).not.toHaveProperty('Authorization');
    expect(event.request.headers).not.toHaveProperty('authorization');
  });
});
