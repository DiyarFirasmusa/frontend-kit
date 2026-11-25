export const endpoints = {
  auth: {
    login: 'api/auth/login',
    refresh: 'api/auth/refresh',
    logout: 'api/auth/logout',
    changePassword: 'api/auth/change-password',
    me: '/me',
  },
  warehouses: {
    list: '/api/warehouses',
    detail: (id: string) => `/api/warehouses/${id}`,
    create: '/api/warehouses',
    update: (id: string) => `/api/warehouses/${id}`,
    remove: (id: string) => `/api/warehouses/${id}`,
    users: (id: string) => `/api/warehouses/${id}/users`,
    removeUser: (id: string, userId: string) =>
      `/api/warehouses/${id}/users/${userId}`,
    changeUserRole: (id: string, userId: string) =>
      `/api/warehouses/${id}/users/${userId}`,
    locations: (id: string) => `/api/warehouses/${id}/locations`,
  },
  unitsOfMeasure: {
    list: '/api/units-of-measure',
    detail: (id: string) => `/api/units-of-measure/${id}`,
    create: '/api/units-of-measure',
    update: (id: string) => `/api/units-of-measure/${id}`,
    remove: (id: string) => `/api/units-of-measure/${id}`,
  },
  itemCategories: {
    list: '/api/item-categories',
    detail: (id: string) => `/api/item-categories/${id}`,
    create: '/api/item-categories',
    update: (id: string) => `/api/item-categories/${id}`,
    remove: (id: string) => `/api/item-categories/${id}`,
    attributes: (id: string) => `/api/item-categories/${id}/attributes`,
    attribute: (id: string, assignmentId: string) =>
      `/api/item-categories/${id}/attributes/${assignmentId}`,
  },
  attributeDefinitions: {
    list: '/api/attribute-definitions',
    detail: (id: string) => `/api/attribute-definitions/${id}`,
    create: '/api/attribute-definitions',
    update: (id: string) => `/api/attribute-definitions/${id}`,
    remove: (id: string) => `/api/attribute-definitions/${id}`,
    options: (id: string) => `/api/attribute-definitions/${id}/options`,
    option: (id: string, optionId: string) =>
      `/api/attribute-definitions/${id}/options/${optionId}`,
    optionsOrder: (id: string) =>
      `/api/attribute-definitions/${id}/options/order`,
  },
  workspace: {
    detail: '/api/workspace',
  },
  search: {
    query: '/api/search',
  },
  directory: {
    resolve: '/api/directory/resolve',
    search: '/api/directory/search',
    roles: '/api/directory/roles',
  },
  notifications: {
    list: '/api/notifications',
    read: (id: string) => `/api/notifications/${id}/read`,
  },
  auditLog: {
    list: '/api/audit-log',
  },
  suppliers: {
    list: '/api/suppliers',
    create: '/api/suppliers',
    detail: (id: string) => `/api/suppliers/${id}`,
    update: (id: string) => `/api/suppliers/${id}`,
    remove: (id: string) => `/api/suppliers/${id}`,
  },
  overview: {
    summary: '/api/overview/summary',
    activity: '/api/overview/activity',
    recent: '/api/overview/recent',
  },
} as const;
