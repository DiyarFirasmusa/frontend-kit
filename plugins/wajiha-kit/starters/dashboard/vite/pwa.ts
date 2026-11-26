import type { PluginOption } from 'vite';
/**
 * OPTIONAL PWA module, off by default. Turn it on with `VITE_PWA=true` in
 * `.env` (build or dev). It adds a web app manifest, a service worker that
 * precaches the built files, and an "update available" toast. See
 * src/modules/pwa/README.md for what it caches and how to reset it.
 *
 * Nothing here runs when the flag is off: vite.config.ts never imports the
 * plugin's output, and `virtual:pwa-register` resolves to a no-op stub.
 */
import { VitePWA } from 'vite-plugin-pwa';
import {
  DEFAULT_PRESET_ID,
  PRESETS,
} from '../src/style/tokens/presets/index.ts';

/** Browser chrome colour taken from the default preset, so it matches the app. */
function brandColours(): { theme: string; background: string } {
  const preset = PRESETS.find((p) => p.id === DEFAULT_PRESET_ID) ?? PRESETS[0];
  if (!preset) {
    throw new Error('no preset defined');
  }
  return {
    theme: preset.light.background,
    background: preset.light.background,
  };
}

export function pwaPlugin(): PluginOption {
  const { theme, background } = brandColours();
  return VitePWA({
    // `prompt`: the user decides when to reload, so unsaved form data is not lost.
    registerType: 'prompt',
    includeAssets: ['icon.svg', 'favicon-32.png', 'apple-touch-icon.png'],
    manifest: {
      name: 'My Dashboard',
      short_name: 'Dashboard',
      description: 'Admin dashboard starter',
      lang: 'ar',
      dir: 'rtl',
      start_url: '/',
      scope: '/',
      display: 'standalone',
      theme_color: theme,
      background_color: background,
      icons: [
        { src: '/icon-192.png', sizes: '192x192', type: 'image/png' },
        { src: '/icon-512.png', sizes: '512x512', type: 'image/png' },
        {
          src: '/icon-maskable-512.png',
          sizes: '512x512',
          type: 'image/png',
          purpose: 'maskable',
        },
      ],
    },
    workbox: {
      globPatterns: ['**/*.{js,css,html,svg,png,woff2}'],
      // The mock API's worker is a dev/demo tool, never part of the offline app.
      globIgnores: ['**/mockServiceWorker.js'],
      // Single-page app: unknown paths get index.html, but never the API or the mock worker.
      navigateFallback: '/index.html',
      navigateFallbackDenylist: [/^\/api\//u, /^\/mockServiceWorker\.js$/u],
      maximumFileSizeToCacheInBytes: 3 * 1024 * 1024,
      cleanupOutdatedCaches: true,
    },
    // Off in dev on purpose: a stale dev service worker is the classic PWA trap.
    devOptions: { enabled: false },
  });
}
