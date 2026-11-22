import type { APIRoute } from 'astro'
import { localePath } from '../lib/links.ts'

export const GET: APIRoute = ({ site }) => {
  const absolute = (path: string): string => new URL(path, site).href
  const urls = (['en', 'ar'] as const)
    .map((locale) => `<url><loc>${absolute(localePath(locale))}</loc></url>`)
    .join('')
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
