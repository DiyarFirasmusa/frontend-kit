import type { PageId } from '../content/guide/pages.ts'
import type { Locale } from '../content/types.ts'
import { routePath, type Route } from './routes.ts'

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/')

export const localePath = (locale: Locale): string => (locale === 'en' ? BASE : `${BASE}${locale}/`)
export const asset = (file: string): string => `${BASE}${file}`
export const routeUrl = (locale: Locale, route: Route): string => localePath(locale) + routePath(route)
export const pageUrl = (locale: Locale, id: PageId): string => routeUrl(locale, { kind: 'page', id })
export const skillUrl = (locale: Locale, name: string): string => routeUrl(locale, { kind: 'skill', name })
export const agentUrl = (locale: Locale, name: string): string => routeUrl(locale, { kind: 'agent', name })
