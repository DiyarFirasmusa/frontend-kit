import { navigate } from 'astro:transitions/client'
import type { Census } from '../../film/shapes/index.ts'
import { all, required } from '../dom.ts'
import { hasChoice, saveChoice, showMotion } from '../motion.ts'
import { scoreOfPage, type Score } from './score.ts'
import type { StageObjects } from './objects.ts'
import type { Stage } from './stage.ts'
import { viewOf, type View } from './view.ts'

const RESTORE_WITHIN_MS = 5000
/** The part of the page that has reached this line has the stage. */
const CUE_LINE = { wide: 0.6, phone: 0.4 }
const NARROW = 820
/** A press that moves further than this is a drag. */
const DRAG_FROM = 6
const RADIANS_PER_PIXEL = 0.006
const CLASSES = ['js', 'live', 'live-loading', 'live-ready', 'no-live']

const root = (): HTMLElement => document.documentElement
let stage: Stage | undefined
let objects: StageObjects | undefined
let loading: Promise<void> | undefined
let cues: HTMLElement[] = []
let queued = false
let score: Score | undefined
let resized: ResizeObserver | undefined

function viewNow(): View {
  const line = innerHeight * (innerWidth < NARROW ? CUE_LINE.phone : CUE_LINE.wide)
  const cue = cues.findLast((element) => element.getClientRects().length > 0 && element.getBoundingClientRect().top <= line)
  for (const element of cues) element.classList.toggle('is-cued', element === cue)
  return viewOf(cue ?? cues[0] ?? document.body)
}

/** Points the stage at whatever is being read now. */
export function cueStage(): void {
  if (queued) return
  queued = true
  requestAnimationFrame(() => {
    queued = false
    const view = viewNow()
    // A scored page is read by the stage itself, frame by frame.
    if (!score) stage?.go(view)
  })
}

/** Reads the new page's score, and again whenever its layout moves. */
function readScore(): void {
  resized?.disconnect()
  score = scoreOfPage()
  stage?.follow(score)
  if (!score) return
  resized = new ResizeObserver(() => score?.measure())
  resized.observe(document.body)
}

function showButtons(playing: boolean): void {
  for (const button of all<HTMLButtonElement>('[data-motion]')) showMotion(button, playing)
}

function still(): void {
  stage?.stop()
  stage?.follow(undefined)
  objects?.reset()
  root().classList.remove('live', 'live-loading', 'live-ready')
  showButtons(false)
}

function unavailable(): void {
  still()
  root().classList.add('no-live')
}

async function load(): Promise<void> {
  const canvas = required<HTMLCanvasElement>('[data-stage]')
  const [{ Film }, { Stage }, { StageObjects }] = await Promise.all([import('../../film/film.ts'), import('./stage.ts'), import('./objects.ts')])
  const census = JSON.parse(required('[data-census]').textContent ?? '') as Census
  const rtl = root().dir === 'rtl'
  const film = await Film.create(canvas, census, rtl)
  const names = new StageObjects(rtl)
  objects = names
  // Too slow is not impossible: the still page keeps its play button.
  stage = new Stage(canvas, film, viewNow(), still, (...drawn) => names.show(...drawn))

  let restoreTimer = 0
  canvas.addEventListener('webglcontextlost', (event) => {
    event.preventDefault()
    restoreTimer = window.setTimeout(unavailable, RESTORE_WITHIN_MS)
  })
  canvas.addEventListener('webglcontextrestored', () => {
    clearTimeout(restoreTimer)
    // After three's own listener has set its state up again.
    setTimeout(() => stage?.restore())
  })
  let held: { x: number; y: number } | undefined
  let dragged = false
  canvas.addEventListener('pointerdown', ({ clientX, clientY, pointerId }) => {
    held = { x: clientX, y: clientY }
    dragged = false
    canvas.setPointerCapture(pointerId)
  })
  canvas.addEventListener('pointermove', ({ clientX, clientY }) => {
    if (!held) return
    const dx = clientX - held.x
    const dy = clientY - held.y
    if (!dragged && Math.hypot(dx, dy) < DRAG_FROM) return
    dragged = true
    stage?.turn(dx * RADIANS_PER_PIXEL, dy * RADIANS_PER_PIXEL)
    held = { x: clientX, y: clientY }
  })
  for (const end of ['pointerup', 'pointercancel', 'lostpointercapture'] as const) {
    canvas.addEventListener(end, () => {
      held = undefined
      stage?.release()
    })
  }
  canvas.addEventListener('click', ({ clientX, clientY }) => {
    if (dragged) return
    const pressed = names.at(clientX, clientY)
    if (!pressed) return stage?.burst()
    // A page that can explain it in place does; otherwise the camera flies there as its page opens.
    const inPlace = document.querySelector<HTMLElement>(`[data-pick="${pressed.key}"]`)
    if (inPlace) inPlace.click()
    else void navigate(pressed.href)
  })
  canvas.addEventListener(
    'pointermove',
    ({ clientX, clientY }) => (canvas.style.cursor = held ? 'grabbing' : names.at(clientX, clientY) ? 'pointer' : 'grab'),
    { passive: true },
  )
}

async function play(): Promise<void> {
  root().classList.add('live')
  if (!stage) root().classList.add('live-loading')
  showButtons(true)
  try {
    loading ??= load()
    await loading
    // The visitor paused, or the still page took over, while it loaded.
    if (!root().classList.contains('live')) return showButtons(false)
    root().classList.remove('live-loading')
    root().classList.add('live-ready')
    readScore()
    if (!score) stage?.go(viewNow())
    stage?.play()
  } catch (error) {
    console.warn('The stage cannot play here, so the still page is shown.', error)
    unavailable()
  }
}

/** Runs once: the stage outlives the pages that come and go over it. */
export function initStage(): void {
  addEventListener('scroll', cueStage, { passive: true })
  document.addEventListener('click', (event) => {
    if (!(event.target instanceof Element) || !event.target.closest('[data-motion]')) return
    const playing = root().classList.contains('live')
    saveChoice(!playing)
    if (playing) still()
    else void play()
  })
  matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => {
    if (event.matches && !hasChoice()) still()
  })
  // A new page arrives with a bare root element.
  document.addEventListener('astro:before-swap', (event) => {
    for (const name of CLASSES) event.newDocument.documentElement.classList.toggle(name, root().classList.contains(name))
  })
  document.addEventListener('astro:page-load', () => {
    cues = all<HTMLElement>('[data-stage-shape]')
    const live = root().classList.contains('live')
    showButtons(live)
    if (!live) return
    if (!stage) return void play()
    readScore()
    if (!score) stage.go(viewNow())
  })
}
