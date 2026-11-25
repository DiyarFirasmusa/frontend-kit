import { expect, test } from './fixtures/app';

test('loads Sentry only after a component error and sends the exception', async ({
  page,
  baseURL,
}) => {
  const sdkRequests: string[] = [];
  page.on('request', (request) => {
    if (/@sentry|vendor-sentry/.test(request.url())) {
      sdkRequests.push(request.url());
    }
  });
  await page.route('**/api/1/envelope/**', (route) =>
    route.fulfill({ json: {} }),
  );
  await page.goto('/this-does-not-exist');
  await expect(
    page.getByRole('heading', {
      name: /^(Item not found|العنصر غير موجود)$/,
    }),
  ).toBeVisible();
  expect(sdkRequests).toEqual([]);

  const envelope = page.waitForRequest(
    (request) =>
      request.url().includes('/api/1/envelope/') &&
      !!request.postData()?.includes('Deferred Sentry browser probe') &&
      !!request.postData()?.includes('"boundary":"react"'),
  );
  const dsn = `http://public@${new URL(baseURL!).host}/1`;
  await page.evaluate(
    async ({ testDsn, message }) => {
      const environmentPath = '/src/env.ts';
      const environment: { env: { VITE_SENTRY_DSN: string } } = await import(
        environmentPath
      );
      environment.env.VITE_SENTRY_DSN = testDsn;
      const routePath = '/src/routes/__root.tsx';
      const root: { Route: { options: { component: () => never } } } =
        await import(routePath);
      root.Route.options.component = function MonitoringProbe(): never {
        throw new Error(message);
      };
    },
    { testDsn: dsn, message: 'Deferred Sentry browser probe' },
  );
  await page
    .getByRole('button', { name: /^(Home|Go home|الرئيسية|العودة للرئيسية)$/i })
    .click();
  const request = await envelope;
  const lines = request.postData()!.split('\n');
  expect(JSON.parse(lines[1]!) as { type: string }).toMatchObject({
    type: 'event',
  });
  expect(
    JSON.parse(lines[2]!) as { extra: Record<string, unknown> },
  ).toMatchObject({ extra: { boundary: 'react' } });
  expect(sdkRequests.length).toBeGreaterThan(0);
});
