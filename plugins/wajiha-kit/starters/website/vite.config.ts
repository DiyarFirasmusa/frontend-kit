import tailwindcss from '@tailwindcss/vite';
import { tanstackStart } from '@tanstack/react-start/plugin/vite';
import viteReact from '@vitejs/plugin-react';
import { nitro } from 'nitro/vite';
import { defineConfig, loadEnv } from 'vite';
import { validateEnv, validateProductionEnv } from './src/shared/env/schema.ts';

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
      throw new Error(
        `Invalid environment (see .env.example, or run "npm run setup:env" for local work):\n- ${problems.join('\n- ')}`,
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
    plugins: [tanstackStart(), nitro(), viteReact(), tailwindcss()],
  };
});
