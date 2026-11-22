import type { Film, Shot } from '../film/film.ts'
import { Governor } from '../film/quality.ts'
import type { Layout } from '../film/render/camera-rig.ts'
import { isShape, type ShapeName } from '../film/shapes/index.ts'
import { clamp, createTimeline, mix, smooth, stopAt } from '../film/timeline.ts'
import { all, required } from './dom.ts'
import { FilmCopy } from './film-copy.ts'
import { FilmLabels } from './film-labels.ts'
import { FilmMoments } from './film-moments.ts'
import { measure } from './measure.ts'

const INTRO_SECONDS = 2.8
const OPEN_SECONDS = 0.8
const FOLLOW = 5
/** Further than this in one go is a jump: cut to black instead of racing through every scene. */
const CUT_DISTANCE = 2.2
const CUT_SECONDS = 0.7
const LANDING = 0.3
/** Where on the screen the slot of the current moment passes. */
const READING_LINE = 0.5
/** The stage has turned aside this far before the first moment is called in, and not yet left. */
const CALLED_IN = { aside: 0.6, move: 0.12 }

/** Plays the film against the scroll position. */
export class Player {
  private readonly canvas = required<HTMLCanvasElement>('#film')
  private readonly details = required<HTMLElement>('[data-details]')
  private readonly shade = required<HTMLElement>('[data-shade]')
  private readonly sections = all<HTMLElement>('[data-scene]')
  private readonly shapes: ShapeName[]
  private measured = measure(this.sections, this.canvas.clientHeight)
  private timeline = createTimeline(this.measured.beats)
  private measureDue = false
  private readonly moments = new FilmMoments()
  private readonly copy: FilmCopy
  private readonly labels: FilmLabels
  private readonly film: Film
  private readonly governor: Governor

  private playing = false
  private queued = 0
  private last = 0
  private time = 0
  private cutAt = -Infinity
  private introDone = false
  private position = 0
  private height = 0
  private width = 0

  constructor(film: Film, rtl: boolean, giveUp: () => void) {
    this.film = film
    this.shapes = this.sections.map(({ dataset }) => (isShape(dataset['shape']) ? dataset['shape'] : 'mark'))
    this.copy = new FilmCopy(this.sections, rtl)
    this.labels = new FilmLabels(rtl)
    this.governor = new Governor(() => film.cheaper(), giveUp)

    addEventListener('scroll', this.request, { passive: true })
    addEventListener('resize', this.remeasureSoon)
    // Fonts, opened answers and wrapped lines all change where a chapter starts.
    new ResizeObserver(this.remeasureSoon).observe(required('[data-film-track]'))
    addEventListener('pageshow', this.resume)
    document.addEventListener('visibilitychange', this.resume)
    addEventListener(
      'pointermove',
      (event) => {
        if (this.playing && event.pointerType === 'mouse') film.point(event.clientX, event.clientY)
      },
      { passive: true },
    )
    // Copy of every scene stays readable by assistive tech, so focus has to bring its scene along.
    this.sections.forEach((section, i) => {
      section.querySelector('[data-tour]')?.addEventListener('focusin', ({ target }) => {
        const slot = (target as Element).closest('[data-moment]')
        if (!this.playing || !slot || slot.querySelector('.is-current')) return
        const { top, height } = slot.getBoundingClientRect()
        scrollTo({ top: scrollY + top + height / 2 - this.canvas.clientHeight * READING_LINE, behavior: 'instant' })
      })
      const block = required<HTMLElement>('[data-copy-block]', section)
      block.addEventListener('focusin', () => {
        if (!this.playing || block.classList.contains('is-shown')) return
        const { starts } = this.timeline
        scrollTo({ top: (starts[i]! + Number(section.dataset['hold']) * LANDING) * this.canvas.clientHeight, behavior: 'instant' })
      })
    })
  }

  /** The scene in view, to keep the place when the layout changes. */
  currentSection(): HTMLElement | undefined {
    return this.sections[this.timeline.at(this.position).index]
  }

  play(): void {
    this.playing = true
    this.height = this.canvas.clientHeight
    this.remeasure()
    this.position = this.goal()
    this.introDone = this.position > 0.05
    this.last = performance.now() / 1000
    this.time = 0
    this.request()
  }

  stop(): void {
    this.playing = false
    cancelAnimationFrame(this.queued)
    this.queued = 0
    this.copy.reset()
    this.labels.reset()
    this.canvas.style.visibility = ''
    this.moments.reset()
  }

  restore(): void {
    this.film.restore()
    this.resume()
  }

  private remeasure(): void {
    this.measured = measure(this.sections, this.canvas.clientHeight)
    this.timeline = createTimeline(this.measured.beats)
    this.measureDue = false
  }

  private readonly remeasureSoon = (): void => {
    this.measureDue = true
    this.request()
  }

  /** The moment at a point of the page, and the object it is about. */
  private follow(index: number, middle: number): { slot: HTMLElement | undefined; stop: number } {
    const { centres, numbers, elements } = this.measured.moments[index]!
    if (centres.length === 0) return { slot: undefined, stop: -1 }
    const at = stopAt(centres, middle)
    const whole = Math.floor(at)
    return { slot: elements[Math.round(at)], stop: mix(numbers[whole]!, numbers[Math.min(whole + 1, numbers.length - 1)]!, at - whole) }
  }

  private goal(): number {
    return clamp(scrollY / Math.max(1, this.height), 0, this.timeline.length)
  }

  private readonly request = (): void => {
    if (this.playing && !this.queued && !document.hidden) this.queued = requestAnimationFrame(this.frame)
  }

  private readonly resume = (): void => {
    this.last = performance.now() / 1000
    this.request()
  }

  private readonly frame = (ms: number): void => {
    this.queued = 0
    if (!this.playing) return
    const now = ms / 1000
    const delta = clamp(now - this.last, 0.001, 0.25)
    this.last = now

    this.height = this.canvas.clientHeight
    this.width = this.canvas.clientWidth
    // No size yet (a hidden pane): look again on the next frame.
    if (!this.width || !this.height) return this.request()
    if (this.measureDue) this.remeasure()
    const goal = this.goal()

    // The details cover the film: nothing to draw until it comes back into view.
    const covered = this.details.getBoundingClientRect().top <= 0
    this.canvas.style.visibility = covered ? 'hidden' : ''
    if (covered) {
      this.position = goal
      this.copy.show({ index: this.sections.length, next: this.sections.length, hold: 0, read: 0, aside: 0, move: 0 }, 0)
      this.labels.reset()
      this.moments.reset()
      return
    }

    this.time += delta
    const before = this.position
    const jumped = Math.abs(goal - this.position) > CUT_DISTANCE
    if (jumped) {
      this.position = goal
      this.cutAt = this.time
    } else {
      this.position += (goal - this.position) * (1 - Math.exp(-FOLLOW * delta))
    }

    const head = this.timeline.at(this.position)
    const { index, next, hold, read, aside, move } = head
    const middle = scrollY + this.height * READING_LINE
    // The camera follows the eased position, the words the real one.
    const stop = aside > 0 ? this.follow(index, middle + (this.position - goal) * this.height).stop : -1
    // The explanation scrolls natively, ahead of the eased stage.
    const native = this.timeline.at(goal)
    const explained = native.index === index ? native.aside : Number(native.index > index)
    const layouts: [Layout, Layout] = [this.layout(index), this.layout(next)]
    let shot: Shot = {
      from: this.shapes[index]!,
      to: this.shapes[next]!,
      hold,
      move,
      layouts,
      aside,
      read,
      stop,
      time: this.time,
      delta,
      speed: jumped ? 0 : (this.position - before) / delta / 3,
      open: smooth(clamp((this.time - this.cutAt) / CUT_SECONDS)),
    }

    // It opens on a storm that becomes the mark; scrolling skips that.
    this.introDone ||= this.position > 0.05 || this.time > INTRO_SECONDS
    if (!this.introDone) {
      shot = {
        ...shot,
        from: 'storm',
        to: this.shapes[0]!,
        hold: 0,
        move: clamp(this.time / INTRO_SECONDS),
        layouts: [layouts[0], layouts[0]],
        aside: 0,
        read: 0,
        stop: -1,
        open: smooth(clamp(this.time / OPEN_SECONDS)),
      }
    }

    this.film.render(shot)
    this.copy.show(head, explained)
    const called = this.introDone && native.aside > CALLED_IN.aside && native.move < CALLED_IN.move
    const told = called ? this.follow(native.index, middle) : undefined
    const from = told && told.stop >= 0 ? this.film.anchors[this.shapes[native.index]!]?.[Math.round(told.stop)] : undefined
    this.moments.show(this.film, told?.slot, from)
    this.labels.show(this.film, shot, this.width, this.height)
    const shaded = mix(mix(Number(layouts[0] === 'side'), 1, aside), Number(layouts[1] === 'side'), move)
    this.shade.style.opacity = String(shaded)
    this.governor.frame(delta)
    this.request()
  }

  private layout(index: number): Layout {
    const layout = this.sections[index]?.dataset['layout']
    return layout === 'high' || layout === 'centre' ? layout : 'side'
  }
}
