/** Groups node_modules into long-lived vendor chunks so app code changes do not bust them. */
const GROUPS: readonly (readonly [string, readonly string[]])[] = [
  [
    'vendor-react',
    [
      'node_modules/react/',
      'node_modules/react-dom/',
      'node_modules/scheduler/',
      'node_modules/clsx/',
    ],
  ],
  ['vendor-recharts', ['recharts', 'victory-vendor']],
  ['vendor-base-ui', ['@base-ui/react']],
  ['vendor-tanstack-query', ['@tanstack/react-query']],
  [
    'vendor-tanstack-router',
    ['@tanstack/react-router', '@tanstack/router-core', '@tanstack/history'],
  ],
  ['vendor-forms', ['react-hook-form']],
  ['vendor-i18n', ['i18next', 'react-i18next']],
  ['vendor-sentry', ['@sentry/']],
  ['vendor-zod', ['zod']],
];

export function vendorChunk(id: string): string | undefined {
  if (!id.includes('node_modules')) {
    return undefined;
  }
  return GROUPS.find(([, needles]) =>
    needles.some((needle) => id.includes(needle)),
  )?.[0];
}
