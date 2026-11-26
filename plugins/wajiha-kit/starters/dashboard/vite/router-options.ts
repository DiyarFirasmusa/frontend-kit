/**
 * TanStack Router file-route options, shared by the Vite plugin
 * (`vite.config.ts`) and `npm run routes` (`scripts/generate-routes.ts`), so the
 * generated `src/routeTree.gen.ts` is the same either way.
 */
export const routerOptions = {
  target: 'react',
  autoCodeSplitting: true,
  routeFileIgnorePattern: '.test.tsx?$',
} as const;
