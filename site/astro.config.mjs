import { defineConfig } from 'astro/config'

export default defineConfig({
  site: 'https://diyarfirasmusa.github.io',
  base: '/frontend-kit/',
  trailingSlash: 'always',
  devToolbar: { enabled: false },
  vite: { build: { target: 'es2022', chunkSizeWarningLimit: 700 } },
})
