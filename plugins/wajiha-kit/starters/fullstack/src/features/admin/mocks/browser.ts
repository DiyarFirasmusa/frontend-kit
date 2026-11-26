import { setupWorker } from 'msw/browser';
import { handlers } from './handlers';

/** The mock API in the browser (a service worker from public/mockServiceWorker.js). */
export const worker = setupWorker(...handlers);
