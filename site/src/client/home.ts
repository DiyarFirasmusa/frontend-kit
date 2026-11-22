import type { Census } from '../film/shapes/index.ts'
import { required } from './dom.ts'
import { hasChoice, saveChoice, showMotion } from './motion.ts'
import type { Player } from './player.ts'

const RESTORE_WITHIN_MS = 5000

const root = document.documentElement
const button = required<HTMLButtonElement>('[data-motion]')
const canvas = required<HTMLCanvasElement>('#film')
let loading: Promise<Player> | undefined
let player: Player | undefined

/** Changes the layout under the visitor without losing the section they were reading. */
function keepPlace(change: () => void, section = sectionInView()): void {
  const fromTop = scrollY < 40
  change()
  if (!fromTop) section?.scrollIntoView({ behavior: 'instant' })
}

/** The most exact thing being read: a block of an explanation, else its scene. */
function sectionInView(): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>('main section[id], .moment-slot')].findLast(
    (section) => section.getBoundingClientRect().top <= innerHeight * 0.4,
  )
}

/** In a scene's hold the film knows best; inside an explanation the page does. */
function placeInFilm(): HTMLElement | undefined {
  const reading = [...document.querySelectorAll<HTMLElement>('[data-tour]')].some((tour) => {
    const { top, bottom } = tour.getBoundingClientRect()
    return top < innerHeight * 0.6 && bottom > innerHeight * 0.4
  })
  return reading ? sectionInView() : (player?.currentSection() ?? sectionInView())
}

function stillPage(): void {
  if (!root.classList.contains('film')) return
  keepPlace(() => {
    player?.stop()
    root.classList.remove('film', 'film-loading', 'film-ready')
  }, placeInFilm())
  showMotion(button, false)
}

function unavailable(): void {
  stillPage()
  root.classList.add('no-film')
}

async function loadPlayer(): Promise<Player> {
  const [{ Film }, { Player }] = await Promise.all([import('../film/film.ts'), import('./player.ts')])
  const census = JSON.parse(required('#census').textContent ?? '') as Census
  const rtl = root.dir === 'rtl'
  const film = await Film.create(canvas, census, rtl)
  // Too slow is not impossible: the still page keeps its play button.
  return new Player(film, rtl, stillPage)
}

async function playFilm(): Promise<void> {
  if (!root.classList.contains('film')) keepPlace(() => root.classList.add('film', 'film-loading'))
  showMotion(button, true)
  try {
    loading ??= loadPlayer()
    player = await loading
    // The visitor paused, or the still page took over, while it loaded.
    if (!root.classList.contains('film')) return showMotion(button, false)
    root.classList.replace('film-loading', 'film-ready')
    player.play()
  } catch (error) {
    console.warn('The film cannot play here, so the still page is shown.', error)
    unavailable()
  }
}

button.addEventListener('click', () => {
  const play = !root.classList.contains('film')
  saveChoice(play)
  if (play) void playFilm()
  else stillPage()
})

matchMedia('(prefers-reduced-motion: reduce)').addEventListener('change', (event) => {
  if (event.matches && !hasChoice()) stillPage()
})

// The GPU can drop the context and hand it straight back, for example while the page reloads.
let restoreTimer = 0
canvas.addEventListener('webglcontextlost', (event) => {
  event.preventDefault()
  restoreTimer = window.setTimeout(unavailable, RESTORE_WITHIN_MS)
})
canvas.addEventListener('webglcontextrestored', () => {
  clearTimeout(restoreTimer)
  // After three's own listener has set its state up again.
  setTimeout(() => player?.restore())
})

if (root.classList.contains('film')) void playFilm()
else showMotion(button, false)
