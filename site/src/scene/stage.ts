import { motionAllowed } from '../client/motion.ts'
import { REST, type Pose } from './parts.ts'
import { createBuffer, travel } from './placed.ts'
import { KitRenderer } from './renderer.ts'
import { Slot } from './slot.ts'
import { chapterAt, clamp, staggered } from './timeline.ts'

const JUMP_SECONDS = 0.75
const FOLLOW_RATE = 9
const SLOW_FRAME = 1 / 38
const SLOW_FRAMES_ALLOWED = 90

export function startStage(canvas: HTMLCanvasElement, chapters: HTMLElement[]): void {
  const view = new KitRenderer(canvas)
  const slots = chapters.map(
    (chapter, i) =>
      // The first chapter opens on the runner and assembles the robot.
      new Slot(chapter.querySelector<HTMLElement>('[data-stage]'), i === 0 && motionAllowed() ? 'sprue' : undefined),
  )
  const frame = createBuffer()
  const pose: Pose = { ...REST }
  const pointer = { x: 0, y: 0 }

  let chapter = -1
  let clock = 0
  let last = performance.now() / 1000
  let jumpedAt = -Infinity
  let slowFrames = 0
  let queued = 0
  let lost = false

  function schedule(): void {
    if (!queued && !lost && !document.hidden) queued = requestAnimationFrame(tick)
  }

  function tick(ms: number): void {
    queued = 0
    const now = ms / 1000
    const delta = clamp(now - last, 0, 0.25)
    last = now
    const moving = motionAllowed()

    if (moving) {
      clock += delta
      slowFrames = delta > SLOW_FRAME ? slowFrames + 1 : Math.max(0, slowFrames - 1)
      if (slowFrames > SLOW_FRAMES_ALLOWED) view.lowerQuality()
    }

    const width = document.documentElement.clientWidth
    const height = canvas.clientHeight
    view.resize(width, height)

    const tops = chapters.map((section) => section.getBoundingClientRect().top)
    const goal = chapterAt(tops, height)
    const follow = 1 - Math.exp(-FOLLOW_RATE * delta)
    chapter = !moving ? Math.round(goal) : chapter < 0 ? goal : chapter + (goal - chapter) * follow

    pose.time = moving ? clock : REST.time
    pose.lookX += ((moving ? pointer.x : 0) - pose.lookX) * (moving ? follow : 1)
    pose.lookY += ((moving ? pointer.y : 0) - pose.lookY) * (moving ? follow : 1)
    const air = (clock - jumpedAt) / JUMP_SECONDS
    pose.jump = moving && air >= 0 && air < 1 ? Math.sin(Math.PI * air) : 0

    const index = Math.min(Math.floor(chapter), slots.length - 1)
    const progress = index === slots.length - 1 ? 0 : chapter - index
    // A chapter without a slot sends the parts away above the screen.
    const away = { left: width / 2, top: -height * 0.3, width: 0, height: 0 }

    const current = slots[index]!
    current.update(view.toWorld(current.rect() ?? away), pose, clock, moving)

    if (progress < 0.0005) {
      view.draw(current.out)
    } else {
      const following = slots[index + 1]!
      following.update(view.toWorld(following.rect() ?? away), pose, clock, moving)
      frame.forEach((part, i) => travel(current.out[i]!, following.out[i]!, staggered(progress, i), i, part))
      view.draw(frame)
    }

    if (moving) schedule()
  }

  addEventListener('scroll', schedule, { passive: true })
  addEventListener('resize', schedule)
  addEventListener(
    'pointermove',
    (event) => {
      if (event.pointerType !== 'mouse') return
      pointer.x = (event.clientX / innerWidth) * 2 - 1
      pointer.y = (event.clientY / innerHeight) * 2 - 1
    },
    { passive: true },
  )
  document.addEventListener('visibilitychange', () => {
    last = performance.now() / 1000
    schedule()
  })
  document.addEventListener('kit:jump', () => {
    if (clock - jumpedAt >= JUMP_SECONDS) jumpedAt = clock
    schedule()
  })
  document.addEventListener('kit:focus', (event) => {
    pose.focus = event.detail
    schedule()
  })
  document.addEventListener('kit:redraw', schedule)
  canvas.addEventListener('webglcontextlost', () => {
    lost = true
    cancelAnimationFrame(queued)
    document.documentElement.classList.remove('has-stage')
  })
  new ResizeObserver(schedule).observe(document.body)

  schedule()
}
