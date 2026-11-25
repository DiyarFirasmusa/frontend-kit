import { defineConfig } from 'astro/config'

// The public origin, for canonical links and the share image. On Vercel it is the site's own address:
// www.wajihakit.com (wajihakit.com and the .vercel.app address both redirect there).
const site = process.env.SITE_URL ?? (process.env.VERCEL ? 'https://www.wajihakit.com' : 'http://localhost:4321')

export default defineConfig({
  site,
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  // Links are fetched ahead: on hover, and the main pages while the home page sits idle (client/warm.ts).
  prefetch: { prefetchAll: true, defaultStrategy: 'hover' },
  // The documentation shows source in the site's own two tones.
  markdown: { syntaxHighlight: false },
  vite: { build: { target: 'es2022', chunkSizeWarningLimit: 700 } },
})
