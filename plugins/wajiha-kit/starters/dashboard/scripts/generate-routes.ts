/**
 * Regenerates src/routeTree.gen.ts from the files under src/routes without
 * starting Vite (the dev server and the build do the same on their own).
 * Run with `npm run routes` after adding or renaming a route file.
 */
import { Generator, getConfig } from '@tanstack/router-generator';
import { routerOptions } from '../vite/router-options.ts';

const root = process.cwd();
const generator = new Generator({
  config: getConfig(routerOptions, root),
  root,
});

await generator.run();
console.log('wrote src/routeTree.gen.ts');
