import { focusAt, flyBetween, type Focus } from '../../film/focus.ts'
import type { Film, Shot } from '../../film/film.ts'
import { clamp, mix, smoother } from '../../film/timeline.ts'
import type { View } from './view.ts'

const CHANGE_SECONDS = 1.7
/** A change asked for during another hurries the one under way. */
const HURRY = 2.5
const FLY_SECONDS = 1.25
const ASIDE_EASE = 3.2

/**
 * Where the stage is and where it is going: a change of shape morphs, a change of object on the same shape flies the
 * camera to it. Either can be asked for at any moment.
 */
export class Flight {
  private readonly anchors: Film['anchors']
  private shown: View
  private next: View | undefined
  private wanted: View
  private move = 0
  private aside = 0
  private start: Focus | undefined
  private focus: Focus | undefined
  private travelled = 1

  constructor(anchors: Film['anchors'], first: View) {
    this.anchors = anchors
    this.shown = { ...first, stop: -1 }
    this.wanted = first
  }

  go(view: View): void {
    const { wanted } = this
    if (view.shape === wanted.shape && view.stop === wanted.stop && view.layout === wanted.layout) return
    this.wanted = view
  }

  /** Whether it is between two shapes. */
  get changing(): boolean {
    return this.next !== undefined
  }

  /** Stands at once on what the scroll brought it to. */
  settle(view: View): void {
    this.wanted = view
    this.shown = { ...view, stop: -1 }
    this.next = undefined
    this.move = 0
    this.aside = 0
    this.focus = undefined
    this.start = undefined
  }

  step(delta: number): Pick<Shot, 'from' | 'to' | 'move' | 'layouts' | 'aside' | 'stop' | 'focus'> {
    if (!this.next && (this.wanted.shape !== this.shown.shape || this.wanted.layout !== this.shown.layout)) {
      this.next = { ...this.wanted }
      this.move = 0
    }
    if (this.next) this.change(this.next, delta)
    else this.aim(delta)

    const to = this.next ?? this.shown
    return {
      from: this.shown.shape,
      to: to.shape,
      move: this.move,
      layouts: [this.shown.layout, to.layout],
      aside: this.focus ? this.aside : 0,
      stop: this.shown.stop,
      focus: this.focus,
    }
  }

  private change(next: View, delta: number): void {
    const hurried = this.wanted.shape !== next.shape
    this.move = clamp(this.move + (delta / CHANGE_SECONDS) * (hurried ? HURRY : 1))
    if (this.move < 1) return
    // It lands on the whole shape, and only then turns to the object.
    this.shown = { ...next, stop: -1 }
    this.next = undefined
    this.move = 0
    this.aside = 0
    this.focus = undefined
    this.start = undefined
  }

  private aim(delta: number): void {
    const { shape, stop } = this.wanted
    const goal = focusAt(shape, this.anchors[shape], stop)
    if (!goal) {
      this.shown.stop = -1
      this.aside = mix(this.aside, 0, 1 - Math.exp(-ASIDE_EASE * delta))
      return
    }
    if (stop !== this.shown.stop) {
      this.shown.stop = stop
      // From wherever the last flight had got to.
      this.start = this.focus ?? goal
      this.travelled = 0
    }
    this.travelled = clamp(this.travelled + delta / FLY_SECONDS)
    this.focus = this.start && this.travelled < 1 ? flyBetween(this.start, goal, smoother(this.travelled)) : goal
    this.aside = mix(this.aside, 1, 1 - Math.exp(-ASIDE_EASE * delta))
  }
}
