import { all } from './dom.ts'

const calm = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => (clearTimeout(timer), resolve()), { once: true })
  })

const SPINNER = ['✻', '✶', '✳', '✢', '·', '✢', '✳', '✶']

/** The console in the opening screen plays four real requests, as Claude Code does: type, Enter, think, answer. */
function playTerminal(signal: AbortSignal): void {
  const terminal = document.querySelector<HTMLElement>('[data-live]')
  if (!terminal || calm()) return
  const demos = all<HTMLElement>('[data-demo]', terminal)
  const dots = all<HTMLElement>('[data-dot]', terminal)
  const box = terminal.querySelector<HTMLElement>('[data-box]')
  const input = terminal.querySelector<HTMLElement>('[data-input]')
  const status = terminal.querySelector<HTMLElement>('[data-status]')
  const spinner = terminal.querySelector<HTMLElement>('[data-spinner]')
  if (!box || !input || !status || !spinner) return
  terminal.classList.add('is-playing')

  void (async () => {
    for (let round = 0; !signal.aborted; round++) {
      const at = round % demos.length
      const demo = demos[at]!
      for (const [i, other] of demos.entries()) other.hidden = i !== at
      for (const [i, dot] of dots.entries()) dot.classList.toggle('is-on', i === at)

      const lines = all<HTMLElement>('[data-line]', demo)
      const sent = demo.querySelector<HTMLElement>('.cc-user')!
      const words = sent.querySelector('q')?.textContent ?? ''
      for (const line of lines) line.classList.remove('is-in')
      demo.classList.add('is-waiting')

      // Typed into the box at the bottom, one key at a time.
      box.classList.add('is-typing')
      input.textContent = ''
      for (let n = 1; n <= words.length && !signal.aborted; n++) {
        input.textContent = words.slice(0, n)
        await wait(36, signal)
      }
      await wait(420, signal)

      // Enter: the box empties, and what was typed stands above as the message.
      input.textContent = ''
      box.classList.remove('is-typing')
      demo.classList.remove('is-waiting')
      await wait(200, signal)

      // Thinking: a turning star and a count of the seconds.
      status.hidden = false
      const began = performance.now()
      const tick = setInterval(() => {
        const seconds = Math.floor((performance.now() - began) / 1000)
        spinner.textContent = SPINNER[Math.floor((performance.now() - began) / 110) % SPINNER.length]!
        const label = status.querySelector('span')
        if (label) label.textContent = `Thinking… ${seconds}s`
      }, 110)
      await wait(1100, signal)
      clearInterval(tick)
      status.hidden = true

      for (const line of lines) {
        if (signal.aborted) return
        line.classList.add('is-in')
        await wait(480, signal)
      }
      await wait(2800, signal)
    }
  })()
}

/** The four numbers count up the first time they are seen. */
function countUp(signal: AbortSignal): void {
  if (calm()) return
  const numbers = all<HTMLElement>('[data-count]')
  if (numbers.length === 0) return
  const watcher = new IntersectionObserver((entries) => {
    for (const { target, isIntersecting } of entries) {
      if (!isIntersecting) continue
      watcher.unobserve(target)
      const element = target as HTMLElement
      const end = Number(element.dataset['count'])
      const start = performance.now()
      const step = (now: number): void => {
        const progress = Math.min((now - start) / 1100, 1)
        element.textContent = String(Math.round(end * (1 - (1 - progress) ** 3)))
        if (progress < 1 && !signal.aborted) requestAnimationFrame(step)
      }
      requestAnimationFrame(step)
      // A page in a background tab does not animate: the number is still right when it is read.
      setTimeout(() => (element.textContent = String(end)), 1600)
    }
  })
  for (const number of numbers) {
    number.textContent = '0'
    watcher.observe(number)
  }
  signal.addEventListener('abort', () => watcher.disconnect())
}

/** A soft light follows the pointer over the grids, so the page answers a hand. */
function glow(signal: AbortSignal): void {
  if (calm() || !matchMedia('(hover: hover)').matches) return
  const surfaces = all<HTMLElement>('.hero, .glow-grid, .start-cases, .install-steps, .works-for, .fit, .kinds, .choices')
  for (const surface of surfaces) {
    surface.addEventListener(
      'pointermove',
      (event) => {
        const { left, top } = surface.getBoundingClientRect()
        surface.style.setProperty('--mx', `${event.clientX - left}px`)
        surface.style.setProperty('--my', `${event.clientY - top}px`)
        surface.classList.add('is-lit')
      },
      { signal },
    )
    surface.addEventListener('pointerleave', () => surface.classList.remove('is-lit'), { signal })
  }
}

export function initLife(signal: AbortSignal): void {
  playTerminal(signal)
  countUp(signal)
  glow(signal)
}
