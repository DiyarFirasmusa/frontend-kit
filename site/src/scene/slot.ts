import { formations, isFormation, type FormationName } from './formations.ts'
import type { Pose } from './parts.ts'
import { collapse, createBuffer, place, travel, type Target } from './placed.ts'
import { staggered } from './timeline.ts'

const MORPH_SECONDS = 1.25

/** The place a chapter gives the kit. It morphs when the page changes its `data-stage`. */
export class Slot {
  readonly out = createBuffer()
  private readonly previous = createBuffer()
  private readonly next = createBuffer()
  private readonly element: HTMLElement | null
  private shown: FormationName | undefined
  private centre = { x: 0, y: 0 }
  private since = -Infinity

  constructor(element: HTMLElement | null, entersAs?: FormationName) {
    this.element = element
    this.shown = entersAs
  }

  rect(): DOMRect | undefined {
    return this.element?.getBoundingClientRect()
  }

  update(target: Target, pose: Pose, now: number, animate: boolean): void {
    const wanted = this.element?.dataset.stage
    if (!isFormation(wanted)) {
      collapse(target, this.out)
      return
    }
    if (this.shown === undefined) this.shown = wanted
    if (this.shown !== wanted) {
      const started = this.out.some((part) => part.shape.x > 0)
      this.previous.forEach((part, i) => {
        part.copy(this.out[i]!)
        // Remembered relative to the slot, which keeps scrolling during the morph.
        part.position.x -= this.centre.x
        part.position.y -= this.centre.y
      })
      if (!started) place(formations[this.shown](pose), { ...target, x: 0, y: 0 }, this.previous)
      this.shown = wanted
      this.since = animate ? now : -Infinity
    }
    this.centre = { x: target.x, y: target.y }
    place(formations[this.shown](pose), target, this.out)

    const progress = (now - this.since) / MORPH_SECONDS
    if (!animate || progress >= 1) return
    this.out.forEach((part, i) => {
      const from = this.previous[i]!
      const to = this.next[i]!
      to.copy(part)
      to.position.x -= target.x
      to.position.y -= target.y
      travel(from, to, staggered(progress, i), i, part)
      part.position.x += target.x
      part.position.y += target.y
    })
  }
}
