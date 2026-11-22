import type { Locale } from '../content/types.ts'

const BASE = import.meta.env.BASE_URL.replace(/\/?$/, '/')

export const localePath = (locale: Locale): string => (locale === 'en' ? BASE : `${BASE}${locale}/`)
export const asset = (file: string): string => `${BASE}${file}`
