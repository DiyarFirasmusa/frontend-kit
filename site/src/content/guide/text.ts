import type { Bilingual } from '../catalogue.ts'

/** English and Arabic side by side, so neither can ship without the other. */
export const t = (en: string, ar: string): Bilingual => ({ en, ar })
