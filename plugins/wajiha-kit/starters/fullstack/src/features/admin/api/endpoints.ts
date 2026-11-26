/**
 * Every admin API path, relative to VITE_ADMIN_API_URL. The mock API (../mocks) answers the same paths.
 * Ids go in already encoded (encodeURIComponent in the service), so the mock can pass ':id' patterns.
 */
export const endpoints = {
  auth: {
    login: '/auth/login',
    logout: '/auth/logout',
  },
  profile: '/profile',
  overview: '/overview',
  suppliers: {
    list: '/suppliers',
    create: '/suppliers',
    update: (id: string) => `/suppliers/${id}`,
    remove: (id: string) => `/suppliers/${id}`,
  },
} as const;
