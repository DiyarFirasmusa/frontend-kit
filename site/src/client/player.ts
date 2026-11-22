import type { Film, Shot } from '../film/film.ts'
import { Governor } from '../film/quality.ts'
import type { Layout } from '../film/render/camera-rig.ts'
import { isShape, type ShapeName } from '../film/shapes/index.ts'
import { clamp, createTimeline, mix, smooth, type Timeline } from '../film/timeline.ts'
import { all, required } from './dom.ts'
import { FilmCopy } from './film-copy.ts'
import { FilmLabels } from './film-labels.ts'

const INTRO_SECONDS = 2.8
const OPEN_SECONDS = 0.8
const FOLLOW = 5
/** Further than this in one go is a jump: cut to black instead of racing through every scene. */
const CUT_DISTANCE = 2.2
const CUT_SECONDS = 0.7
const LANDING = 0.3

/** Plays the film against the scroll position. */
export class Player {
  private readonly canvas = required<HTMLCanvasElement>('#film')
  private readonly details = required<HTMLElement>('[data-details]')
  private readonly shade = required<HTMLElement>('[data-shade]')
  private readonly cue = required<HTMLElement>('[data-cue]')
  private readonly sections = all<HTMLElement>('[data-scene]')
  private readonly shapes: ShapeName[]
  private readonly timeline: Timeline
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
    this.timeline = createTimeline(this.sections.map(({ dataset }) => ({ hold: Number(dataset['hold']), travel: Number(dataset['travel']) })))
    this.copy = new FilmCopy(this.sections, rtl)
    this.labels = new FilmLabels(rtl)
    this.governor = new Governor(() => film.cheaper(), giveUp)

    addEventListener('scroll', this.request, { passive: true })
    addEventListener('resize', this.request)
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
      section.addEventListener('focusin', () => {
        if (!this.playing || required('[data-copy-block]', section).classList.contains('is-shown')) return
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
    const goal = this.goal()

    // The details cover the film: nothing to draw until it comes back into view.
    const covered = this.details.getBoundingClientRect().top <= 0
    this.canvas.style.visibility = covered ? 'hidden' : ''
    if (covered) {
      this.position = goal
      this.copy.show({ index: this.sections.length, next: this.sections.length, hold: 0, move: 0 })
      this.labels.reset()
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
    const { index, next, hold, move } = head
    const layouts: [Layout, Layout] = [this.layout(index), this.layout(next)]
    let shot: Shot = {
      from: this.shapes[index]!,
      to: this.shapes[next]!,
      hold,
      move,
      layouts,
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
        open: smooth(clamp(this.time / OPEN_SECONDS)),
      }
    }

    this.film.render(shot)
    this.copy.show(head)
    this.labels.show(this.film, shot, this.width, this.height)
    this.shade.style.opacity = String(mix(Number(layouts[0] === 'side'), Number(layouts[1] === 'side'), move))
    this.cue.style.opacity = String(this.position < 0.08 ? clamp(this.time - INTRO_SECONDS + 0.2) : 0)
    this.governor.frame(delta)
    this.request()
  }

  private layout(index: number): Layout {
    const layout = this.sections[index]?.dataset['layout']
    return layout === 'high' || layout === 'centre' ? layout : 'side'
  }
}
