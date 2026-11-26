import { setupServer } from 'msw/node';
import { handlers } from '@/features/admin/mocks/handlers';

/** The admin's mock API for unit tests. setup.ts starts it; a test can add handlers with server.use(). */
export const server = setupServer(...handlers);
