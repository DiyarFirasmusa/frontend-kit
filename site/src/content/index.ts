import { arDetails } from './ar-details.ts'
import { ar } from './ar.ts'
import { enDetails } from './en-details.ts'
import { en } from './en.ts'
import type { Copy, Details, Locale } from './types.ts'

export const content: Record<Locale, Copy & Details> = {
  en: { ...en, ...enDetails },
  ar: { ...ar, ...arDetails },
}
