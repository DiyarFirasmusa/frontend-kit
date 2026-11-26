import { z } from 'zod';

// The strict Content-Security-Policy forbids eval in production. zod tries `new Function` once per schema to
// build a faster parser, the browser reports each try as a CSP violation (noise for a report-uri), and zod
// then falls back to its normal parser anyway. Switching the fast path off removes the violation reports.
// Import z from here, not from 'zod', in any code the browser runs.
z.config({ jitless: true });

export { z };
