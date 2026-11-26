/** TanStack Query keys, one factory per resource, so invalidation always names the same arrays. */
export const qk = {
  profile: ['profile'] as const,
  overview: ['overview'] as const,
  suppliers: {
    all: ['suppliers'] as const,
    list: (params: object) => ['suppliers', 'list', params] as const,
  },
};
