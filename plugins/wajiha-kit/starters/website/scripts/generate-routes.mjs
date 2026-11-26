// Regenerates src/routeTree.gen.ts from the files in src/routes, then exits. It runs the same Start plugin as
// `npm run dev` and `npm run build`, so the output is identical, but nothing keeps running (the dev server never
// exits, and an agent that starts it in the foreground hangs). Run it after adding, renaming or deleting a file
// in src/routes.
import { createServer } from 'vite';

const server = await createServer({
  server: { middlewareMode: true },
  appType: 'custom',
  logLevel: 'error',
});
await server.pluginContainer.buildStart({});
console.log('routes: src/routeTree.gen.ts is up to date');
// Exit instead of server.close(): closing the dev runtime only prints a harmless module error here.
process.exit(0);
