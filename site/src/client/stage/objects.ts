import type { Film, Shot } from '../../film/film.ts'
import type { Vec3 } from '../../film/shapes/blocks.ts'
import { clamp } from '../../film/timeline.ts'
import { all } from '../dom.ts'

const NARROW = 820
/** The words of a page take this share of the screen. */
const COLUMN = { wide: 0.5, phone: 0.5 }
/** On a phone the words begin to shade the stage here, so no name is written lower. */
const NAMED_ABOVE = 0.385
/** How near a press must land, in pixels, at the size the object has at 22 units away. */
const REACH = { skills: 110, agents: 90, rules: 120, checks: 0 }
const REACH_AT = 22

/** Where a press lands on an object, which is not where its name is written. */
const BODY = {
  skills: (anchor) => anchor,
  agents: ([x, , z]) => [x, 6, z],
  rules: ([x, y, z]) => [x, y * 0.5, z],
  checks: (anchor) => anchor,
} satisfies Record<keyof typeof REACH, (anchor: Vec3) => Vec3>

interface Thing {
  element: HTMLElement
  shape: keyof typeof REACH
  index: number
  href: string
  x: number
  y: number
  reach: number
}

/** The names on the objects, and which object a press on the stage means. */
export class StageObjects {
  private readonly things: Thing[]
  private readonly rtl: boolean

  constructor(rtl: boolean) {
    this.rtl = rtl
    this.things = all<HTMLElement>('[data-object]').map((element) => {
      const [shape, index] = (element.dataset['object'] ?? '').split('-')
      return { element, shape: shape as keyof typeof REACH, index: Number(index), href: element.dataset['href'] ?? '', x: 0, y: 0, reach: 0 }
    })
  }

  show(film: Film, { from, move, aside, stop }: Shot, width: number, height: number): void {
    for (const thing of this.things) {
      thing.reach = 0
      const point = thing.shape === from && move < 0.2 ? film.anchors[thing.shape]?.[thing.index] : undefined
      if (!point) {
        if (!thing.element.hidden) thing.element.hidden = true
        continue
      }
      const { x, y, behind, distance } = film.project(point)
      const narrow = width < NARROW
      const underWords = narrow ? y > height * COLUMN.phone : this.rtl ? x > width * (1 - COLUMN.wide) : x < width * COLUMN.wide
      if (behind || underWords || x < 0 || x > width) {
        thing.element.hidden = true
        continue
      }
      const body = film.project(BODY[thing.shape](point))
      thing.x = body.x
      thing.y = body.y
      thing.reach = REACH[thing.shape] * Math.min(1.6, REACH_AT / Math.max(1, distance))
      const focused = aside > 0.4 && thing.index === stop
      // The rings share one centre, so only the one being read is named.
      thing.element.hidden = (thing.shape === 'checks' && !focused) || (narrow && y > height * NAMED_ABOVE)
      thing.element.classList.toggle('is-focus', focused)
      const size = thing.shape === 'skills' ? Math.min(1.2, (REACH_AT / distance) * Math.min(1, width / 560 + 0.05)) : 1
      thing.element.style.opacity = String((1 - clamp(move * 5)) * (focused || stop < 0 ? 1 : 1 - aside * 0.6))
      // The council reaches past both edges, and its names stay readable inside them.
      const left = thing.shape === 'agents' ? `clamp(50%, ${x}px, ${width}px - 50%)` : `${x}px`
      thing.element.style.transform = `translate(${left}, ${y}px) translate(-50%, -50%) scale(${size})`
    }
  }

  at(x: number, y: number): { key: string; href: string } | undefined {
    let found: Thing | undefined
    let nearest = Infinity
    for (const thing of this.things) {
      const away = Math.hypot(thing.x - x, thing.y - y)
      if (away > thing.reach || away >= nearest) continue
      found = thing
      nearest = away
    }
    return found && { key: `${found.shape}-${found.index}`, href: found.href }
  }

  reset(): void {
    for (const thing of this.things) {
      thing.element.hidden = true
      thing.reach = 0
    }
  }
}
