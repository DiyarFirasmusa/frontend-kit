import type { Bilingual } from '../../catalogue.ts'

/** The page of one skill, written from its SKILL.md. */
export interface SkillGuide {
  /** What it is, for someone who has never heard of skills. */
  plain: Bilingual
  /** Things to type that call for it. */
  ask: Bilingual[]
  steps: Bilingual[]
  result: Bilingual[]
  limits: Bilingual[]
  related: string[]
  needs?: Bilingual
}
