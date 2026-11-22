import { build } from './build.ts'
import { dashboard } from './dashboard.ts'
import { inspect } from './inspect.ts'
import { ship } from './ship.ts'
import type { SkillGuide } from './types.ts'
import { website } from './website.ts'
import { work } from './work.ts'

export const skillGuides: Record<string, SkillGuide> = { ...build, ...dashboard, ...website, ...work, ...inspect, ...ship }
