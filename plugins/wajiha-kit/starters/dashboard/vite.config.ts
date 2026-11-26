import { readFileSync, rmSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { sentryVitePlugin } from '@sentry/vite-plugin';
import tailwindcss from '@tailwindcss/vite';
import { tanstackRouter } from '@tanstack/router-plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { visualizer } from 'rollup-plugin-visualizer';
import { defineConfig, loadEnv, type PluginOption } from 'vite';
import { z } from 'zod';
import { pwaPlugin } from './vite/pwa.ts';
import { routerOptions } from './vite/router-options.ts';
import { vendorChunk } from './vite/vendor-chunks.ts';

const pkg = z
  .object({ name: z.string(), version: z.string() })
  .parse(
    JSON.parse(
      readFileSync(new URL('./package.json', import.meta.url), 'utf8'),
    ),
  );

/* Source maps are uploaded to Sentry only when CI provides an auth token; the
   .map files are deleted from dist afterwards so they never ship. */
const SENTRY_UPLOAD = !!process.env.SENTRY_AUTH_TOKEN;

export default defineConfig(({ mode }) => {
  const env = loadEnv(mode, process.cwd(), 'VITE_');
  const pwa = env.VITE_PWA === 'true';

  const plugins: PluginOption[] = [
    tanstackRouter(routerOptions),
    tailwindcss(),
    viteReact(),
  ];

  if (pwa) {
    plugins.push(pwaPlugin());
  }

  // public/ ships the mock API's service worker; a build without mocks drops it.
  if (env.VITE_USE_MOCK !== 'true') {
    plugins.push({
      name: 'drop-mock-service-worker',
      apply: 'build',
      closeBundle() {
        rmSync(
          fileURLToPath(
            new URL('./dist/mockServiceWorker.js', import.meta.url),
          ),
          { force: true },
        );
      },
    });
  }

  if (mode === 'analyze') {
    plugins.push(
      visualizer({
        filename: 'stats.html',
        gzipSize: true,
        brotliSize: true,
        open: true,
      }),
    );
  }

  if (SENTRY_UPLOAD) {
    plugins.push(
      sentryVitePlugin({
        org: process.env.SENTRY_ORG,
        project: process.env.SENTRY_PROJECT,
        authToken: process.env.SENTRY_AUTH_TOKEN,
        release: { name: `${pkg.name}@${pkg.version}` },
        sourcemaps: { filesToDeleteAfterUpload: ['./dist/**/*.map'] },
        telemetry: false,
      }),
    );
  }

  return {
    resolve: {
      alias: {
        '@': fileURLToPath(new URL('./src', import.meta.url)),
        // With the PWA module off, its virtual import resolves to a no-op.
        ...(pwa
          ? {}
          : {
              'virtual:pwa-register': fileURLToPath(
                new URL('./vite/pwa-register-stub.ts', import.meta.url),
              ),
            }),
      },
    },

    define: {
      'import.meta.env.VITE_APP_VERSION': JSON.stringify(pkg.version),
      'import.meta.env.VITE_APP_NAME': JSON.stringify(pkg.name),
    },

    server: {
      port: 3000,
      // Listens on every interface (LAN, VPN) so a phone can open it. The mock
      // API needs a service worker, which browsers allow only on localhost or
      // https: from another device use https, or a real API (README).
      host: true,
    },

    // Found late (inside code-split routes), these would make Vite re-optimise
    // and reload the first page; listing them keeps a cold start stable.
    optimizeDeps: {
      include: ['@tanstack/react-table'],
    },

    plugins,

    build: {
      sourcemap: SENTRY_UPLOAD ? ('hidden' as const) : false,
      chunkSizeWarningLimit: 450,
      rolldownOptions: {
        output: {
          manualChunks: vendorChunk,
          minify: {
            compress: { dropConsole: true, dropDebugger: true },
          },
        },
      },
    },
  };
});
