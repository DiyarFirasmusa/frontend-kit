import type { Film, Shot } from '../../film/film.ts'
import { Governor } from '../../film/quality.ts'
import { clamp, smooth } from '../../film/timeline.ts'
import { Flight } from './flight.ts'
import type { Score } from './score.ts'
import type { View } from './view.ts'

const INTRO_SECONDS = 2.2
const OPEN_SECONDS = 0.7
const ORBIT_SECONDS = 22
const BURST_SECONDS = 1.5
/** Slowly: the blocks and the words follow the scroll a moment behind it. */
const FOLLOW = 1.9
/** A jump across several cues shows only the last change. */
const JUMP = 1.6
const LEAN = { most: 1, perCue: 1.4 }
/** How far it can be turned by hand, and how soon it turns back when let go. */
const TURN_LIMIT = { yaw: 2.4, pitch: 0.5 }
const TURN_BACK = 0.5

/** The one stage under every page. It outlives navigation, so the camera can fly from one page to the next. */
export class Stage {
  private readonly canvas: HTMLCanvasElement
  private readonly film: Film
  private readonly flight: Flight
  private readonly governor: Governor
  private readonly drawn: (film: Film, shot: Shot, width: number, height: number) => void
  private readonly first: View
  private playing = false
  private queued = 0
  private last = 0
  private time = 0
  private turned: [yaw: number, pitch: number] = [0, 0]
  private held = false
  private burstAt = -Infinity
  private score: Score | undefined
  private position = 0

  constructor(canvas: HTMLCanvasElement, film: Film, first: View, giveUp: () => void, drawn: Stage['drawn']) {
    this.canvas = canvas
    this.film = film
    this.first = first
    this.drawn = drawn
    this.flight = new Flight(film.anchors, first)
    this.governor = new Governor(() => film.cheaper(), giveUp)
    addEventListener('resize', this.request)
    addEventListener('pageshow', this.resume)
    document.addEventListener('visibilitychange', this.resume)
    addEventListener(
      'pointermove',
      (event) => {
        if (this.playing && event.pointerType === 'mouse') film.point(event.clientX, event.clientY)
      },
      { passive: true },
    )
  }

  go(view: View): void {
    this.flight.go(view)
  }

  /** From here on the scroll plays it; without a score the clock does. */
  follow(score: Score | undefined): void {
    this.score?.release()
    this.score = score
    if (!score) return
    this.position = score.position()
    score.play(this.position)
  }

  /** Follows a hand dragging it. */
  turn(dx: number, dy: number): void {
    this.held = true
    this.turned = [clamp(this.turned[0] - dx, -TURN_LIMIT.yaw, TURN_LIMIT.yaw), clamp(this.turned[1] - dy, -TURN_LIMIT.pitch, TURN_LIMIT.pitch)]
  }

  release(): void {
    this.held = false
  }

  /** Blows it apart; it builds itself again. */
  burst(): void {
    if (this.time - this.burstAt > BURST_SECONDS) this.burstAt = this.time
  }

  play(): void {
    this.playing = true
    this.resume()
  }

  stop(): void {
    this.playing = false
    cancelAnimationFrame(this.queued)
    this.queued = 0
  }

  restore(): void {
    this.film.restore()
    this.resume()
  }

  private speed = 0

  /** The scroll between two cues is the change itself; on a cue the clock takes whatever is asked of it. */
  private played(delta: number): ReturnType<Flight['step']> {
    const { score, flight } = this
    this.speed = 0
    if (!score) return flight.step(delta)
    const goal = score.position()
    if (Math.abs(goal - this.position) > JUMP) this.position = goal - Math.sign(goal - this.position)
    const before = this.position
    this.position += (goal - this.position) * (1 - Math.exp(-FOLLOW * delta))
    if (Math.abs(goal - this.position) < 0.002) this.position = goal
    this.speed = clamp((this.position - before) / delta / LEAN.perCue, -LEAN.most, LEAN.most)
    score.play(this.position)

    const index = Math.floor(this.position)
    const move = this.position - index
    const from = score.viewAt(index)
    if (move < 0.005 || flight.changing) {
      flight.go(move < 0.5 ? from : score.viewAt(index + 1))
      return flight.step(delta)
    }
    const to = score.viewAt(index + 1)
    flight.settle(move < 0.5 ? from : to)
    return { from: from.shape, to: to.shape, move, layouts: [from.layout, to.layout], aside: 0, stop: -1, focus: undefined }
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
    const { clientWidth, clientHeight } = this.canvas
    if (!clientWidth || !clientHeight) return this.request()

    this.time += delta
    if (!this.held) {
      const back = Math.exp(-TURN_BACK * delta)
      this.turned = [this.turned[0] * back, this.turned[1] * back]
    }
    const since = clamp((this.time - this.burstAt) / BURST_SECONDS)
    let shot: Shot = {
      ...this.played(delta),
      // With nothing asked of it, the camera drifts along its shot and back.
      hold: 0.5 - 0.5 * Math.cos((this.time / ORBIT_SECONDS) * Math.PI * 2),
      read: 0,
      turned: this.turned,
      burst: Math.sin(Math.PI * Math.sqrt(since)) * (1 - since * 0.25),
      time: this.time,
      delta,
      speed: this.speed,
      open: smooth(clamp(this.time / OPEN_SECONDS)),
    }
    // It opens on a storm that becomes whatever the first page is about.
    if (this.time < INTRO_SECONDS) {
      shot = { ...shot, from: 'storm', to: this.first.shape, hold: 0, move: this.time / INTRO_SECONDS, aside: 0, stop: -1, focus: undefined }
    }
    this.film.render(shot)
    this.drawn(this.film, shot, clientWidth, clientHeight)
    this.governor.frame(delta)
    this.request()
  }
}
