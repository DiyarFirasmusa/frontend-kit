import type { Census } from '../film/shapes/index.ts'
import { initCopy } from './copy-button.ts'
import { required } from './dom.ts'
import { initGate } from './gate.ts'
import { hasChoice, saveChoice, showMotion } from './motion.ts'
import { initNavigation } from './navigation.ts'
import type { Player } from './player.ts'

initCopy()
initGate()
initNavigation()

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

function sectionInView(): HTMLElement | undefined {
  return [...document.querySelectorAll<HTMLElement>('main section[id]')].findLast(
    (section) => section.getBoundingClientRect().top <= innerHeight * 0.4,
  )
}

function stillPage(): void {
  if (!root.classList.contains('film')) return
  const inFilm = required('[data-details]').getBoundingClientRect().top > 0
  keepPlace(() => {
    player?.stop()
    root.classList.remove('film', 'film-loading', 'film-ready')
  }, inFilm ? player?.currentSection() : sectionInView())
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
  return new Player(film, rtl, unavailable)
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

canvas.addEventListener('webglcontextlost', unavailable)

if (root.classList.contains('film')) void playFilm()
else showMotion(button, false)
