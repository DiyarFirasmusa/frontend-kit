import type { Vec3 } from '../film/shapes/blocks.ts'
import type { Film } from '../film/film.ts'
import { all, required } from './dom.ts'

const BORN_MS = 720
const EASE = 'cubic-bezier(0.16, 1, 0.3, 1)'
/** A name grows from about the size it has on its object. */
const BORN_SCALE = 0.3

/**
 * One moment at a time, in place. It changes whole, never half way, so nothing half-read rests on the screen; a name
 * flies out of the object the stage lit.
 */
export class FilmMoments {
  private readonly copies: Map<HTMLElement, HTMLElement>
  private current: HTMLElement | undefined
  private flight: Animation | undefined

  constructor() {
    this.copies = new Map(all<HTMLElement>('[data-moment]').map((slot) => [slot, required<HTMLElement>('[data-moment-copy]', slot)]))
  }

  show(film: Film, slot: HTMLElement | undefined, from: Vec3 | undefined): void {
    if (slot === this.current) return
    const down = !slot || !this.current || Boolean(this.current.compareDocumentPosition(slot) & Node.DOCUMENT_POSITION_FOLLOWING)
    this.flight?.cancel()
    if (this.current) {
      const old = this.copies.get(this.current)!
      old.classList.toggle('is-before', down)
      old.classList.remove('is-current')
    }
    this.current = slot
    if (!slot) return
    const copy = this.copies.get(slot)!
    copy.classList.toggle('is-before', !down)
    // Lets it start from where it waits before it is called in.
    void copy.offsetWidth
    copy.classList.add('is-current')
    if (from) this.born(film, required<HTMLElement>('[data-moment-title]', copy), from)
  }

  private born(film: Film, title: HTMLElement, from: Vec3): void {
    const point = film.project(from)
    if (point.behind) return
    const box = title.getBoundingClientRect()
    const x = point.x - (box.left + box.width / 2)
    const y = point.y - (box.top + box.height / 2)
    this.flight = title.animate(
      [
        { transform: `translate(${x}px, ${y}px) scale(${BORN_SCALE})`, opacity: 0, filter: 'blur(5px)' },
        { opacity: 1, filter: 'blur(0)', offset: 0.22 },
        { transform: 'none', opacity: 1 },
      ],
      { duration: BORN_MS, easing: EASE },
    )
  }

  reset(): void {
    this.flight?.cancel()
    for (const copy of this.copies.values()) copy.classList.remove('is-current', 'is-before')
    this.current = undefined
  }
}
