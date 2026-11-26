import type { FileRoutesByTo } from '@/routeTree.gen';

/**
 * Every route path without a parameter, read from the generated route tree:
 * adding a route file adds it here, and a typo in a link or a nav item fails
 * the typecheck. (A path with `$id` needs params, so it is not a plain link.)
 */
export type StaticRoutePath = Exclude<
  keyof FileRoutesByTo,
  `${string}$${string}`
>;
