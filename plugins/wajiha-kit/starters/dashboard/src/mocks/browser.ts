import { setupWorker } from 'msw/browser';
import { mockHandlers } from './index';

/** Service-worker mock backend for the playground; started from main.tsx. */
export const worker = setupWorker(...mockHandlers);
