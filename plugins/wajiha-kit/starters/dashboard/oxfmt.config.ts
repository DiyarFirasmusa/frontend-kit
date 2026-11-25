import { defineConfig } from 'oxfmt';

export default defineConfig({
  printWidth: 80,
  singleQuote: true,

  sortTailwindcss: {},
  sortImports: {
    enabled: true,
    newlinesBetween: false,
  },

  ignorePatterns: [
    '**/routeTree.gen.ts',
    // Written by `npm run tokens`; tokens.test.ts checks them byte for byte.
    'src/style/theme.css',
    'src/style/preset.css',
    // Plain browser script, kept readable as-is.
    'public/theme-init.js',
    'public/mockServiceWorker.js',
    'package-lock.json',
  ],
});
