import { defineConfig } from 'astro/config'

// The public origin, for canonical links and the share image. Vercel provides it during its builds.
const host = process.env.VERCEL_PROJECT_PRODUCTION_URL
const site = process.env.SITE_URL ?? (host ? `https://${host}` : 'http://localhost:4321')

export default defineConfig({
  site,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  // The documentation shows source in the site's own two tones.
  markdown: { syntaxHighlight: false },
  vite: { build: { target: 'es2022', chunkSizeWarningLimit: 700 } },
})
