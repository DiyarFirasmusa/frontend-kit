import type { APIRoute } from 'astro'
import { routeUrl } from '../lib/links.ts'
import { allRoutes, LOCALES } from '../lib/routes.ts'

export const GET: APIRoute = ({ site }) => {
  const urls = LOCALES.flatMap((locale) => allRoutes().map((route) => `<url><loc>${new URL(routeUrl(locale, route), site).href}</loc></url>`))
  return new Response(`<?xml version="1.0" encoding="UTF-8"?><urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">${urls.join('')}</urlset>`, {
    headers: { 'Content-Type': 'application/xml' },
  })
}
