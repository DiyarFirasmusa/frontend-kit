import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import { validateEnv, validateProductionEnv, WEBHOOK_REQUIRED } from './src/shared/env/schema.ts';
import { STATIC_FILE_HEADERS, STATIC_IMAGE_HEADERS } from './src/shared/server/security-headers.ts';

export const DEV_PORT = 5190;

export default defineConfig(({ command, mode }) => {
  // Fail the build, not the first visitor: every value is checked before anything is bundled.
  const env = loadEnv(mode, process.cwd(), '');
  if (command === 'build') {
    const result = validateEnv(env);
    const problems = [
      ...(result.ok ? [] : result.problems),
      ...(mode === 'production' ? validateProductionEnv(env) : []),
    ];
    if (problems.length > 0) {
      // A plain message and exit code 1: a stack trace here would only hide the reason.
      console.error(
        `\nBuild stopped: missing or invalid settings. Set them in the environment or in .env.local ` +
          `(run "npm run setup:env" once; see .env.example):\n- ${problems.join('\n- ')}\n`,
      );
      process.exit(1);
    }
    if (result.ok && result.value.VITE_ALLOW_INDEXING && !result.value.CONTACT_WEBHOOK_URL) {
      console.warn(
        `\nNote: ${WEBHOOK_REQUIRED}. Set it where the server runs, or the server will refuse to start.\n`,
      );
    }
  }

  return {
    server: { port: DEV_PORT, strictPort: true },
    resolve: { tsconfigPaths: true },
    build: {
      // Never inline files as data: URIs, so the CSP can forbid data: images and fonts.
      assetsInlineLimit: 0,
    },
    // Order matters: the Start plugin first, React after it.
    plugins: [
      tanstackStart(),
      nitro({
        // Ship .br and .gz copies of the built files; the server picks one from Accept-Encoding.
        compressPublicAssets: true,
        // Checks the runtime environment once at server start (see the file).
        plugins: ['./src/shared/server/check-env-plugin.ts'],
        // Files from public/ and the build skip the request middleware, so they get their headers here.
        routeRules: {
          '/assets/**': { headers: STATIC_FILE_HEADERS },
          '/site.webmanifest': { headers: STATIC_FILE_HEADERS },
          '/images/**': { headers: STATIC_IMAGE_HEADERS },
          '/favicon.svg': { headers: STATIC_IMAGE_HEADERS },
          '/og-default.png': { headers: STATIC_IMAGE_HEADERS },
        },
      }),
      viteReact(),
      tailwindcss(),
    ],
  };
});
