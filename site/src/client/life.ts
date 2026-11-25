import { all } from './dom.ts'

const calm = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    const timer = setTimeout(resolve, ms)
    signal.addEventListener('abort', () => (clearTimeout(timer), resolve()), { once: true })
  })

/** Keeps the newest message in view, as a chat does. */
const follow = (body: HTMLElement): void => body.scrollTo({ top: body.scrollHeight, behavior: calm() ? 'auto' : 'smooth' })

/** The chat in the opening screen plays the first run: install, answer the questions, get the project. */
function playChat(signal: AbortSignal): void {
  const chat = document.querySelector<HTMLElement>('[data-live]')
  if (!chat || calm()) return
  const body = chat.querySelector<HTMLElement>('[data-body]')
  const box = chat.querySelector<HTMLElement>('[data-box]')
  const input = chat.querySelector<HTMLElement>('[data-input]')
  const status = chat.querySelector<HTMLElement>('[data-status]')
  const events = all<HTMLElement>('[data-ev]', chat)
  if (!body || !box || !input || !status) return
  chat.classList.add('is-playing')

  // It plays only while it is on screen, the tab is open and the visitor has not paused it.
  let seen = false
  let paused = false
  let resume: (() => void) | undefined
  const free = (): boolean => seen && !paused && !document.hidden
  const wake = (): void => {
    if (free()) resume?.()
  }
  const ready = (): Promise<void> =>
    free() || signal.aborted ? Promise.resolve() : new Promise<void>((done) => (resume = done))
  const watcher = new IntersectionObserver(([entry]) => {
    seen = Boolean(entry?.isIntersecting)
    wake()
  })
  watcher.observe(chat)
  document.addEventListener('visibilitychange', wake, { signal })
  signal.addEventListener('abort', () => (watcher.disconnect(), resume?.()))
  const button = chat.querySelector<HTMLButtonElement>('[data-pause]')
  if (button) {
    button.hidden = false
    button.addEventListener(
      'click',
      () => {
        paused = !paused
        button.setAttribute('aria-pressed', String(paused))
        button.setAttribute('aria-label', (paused ? button.dataset['playLabel'] : button.dataset['pauseLabel']) ?? '')
        chat.classList.toggle('is-paused', paused)
        wake()
      },
      { signal },
    )
  }
  const pace = async (ms: number): Promise<void> => {
    await ready()
    await wait(ms, signal)
  }

  const think = async (ms: number): Promise<void> => {
    status.hidden = false
    follow(body)
    await pace(ms)
    status.hidden = true
  }

  void (async () => {
    while (!signal.aborted) {
      for (const event of events) event.classList.remove('is-in', 'is-picked')
      body.scrollTop = 0
      await pace(600)

      for (const event of events) {
        if (signal.aborted) return
        const kind = event.dataset['ev']
        if (kind === 'user') {
          // Typed into the box at the bottom, one key at a time, then sent.
          const words = event.querySelector('[data-say]')?.textContent?.trim() ?? ''
          box.classList.add('is-typing')
          for (let n = 1; n <= words.length && !signal.aborted; n++) {
            input.textContent = words.slice(0, n)
            await pace(32)
          }
          await pace(380)
          input.textContent = ''
          box.classList.remove('is-typing')
        } else if (kind === 'claude' || kind === 'ready') {
          await think(900)
        } else if (kind === 'tool') {
          await think(650)
        }
        event.classList.add('is-in')
        follow(body)
        if (kind === 'ask') {
          // The question waits a moment, then your answer is picked.
          await pace(1300)
          event.classList.add('is-picked')
          await pace(800)
        } else {
          await pace(kind === 'ready' ? 5200 : 450)
        }
      }
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

/** A soft light follows the pointer over the grids. One update per frame, so a fast hand costs nothing. */
function glow(signal: AbortSignal): void {
  if (calm() || !matchMedia('(hover: hover)').matches) return
  const surfaces = all<HTMLElement>('.glow-grid, .start-cases, .install-steps, .works-for, .fit, .choices')
  for (const surface of surfaces) {
    let frame = 0
    let x = 0
    let y = 0
    const paint = (): void => {
      frame = 0
      surface.style.setProperty('--mx', `${x}px`)
      surface.style.setProperty('--my', `${y}px`)
    }
    surface.addEventListener(
      'pointermove',
      (event) => {
        const { left, top } = surface.getBoundingClientRect()
        x = event.clientX - left
        y = event.clientY - top
        surface.classList.add('is-lit')
        if (!frame) frame = requestAnimationFrame(paint)
      },
      { passive: true, signal },
    )
    surface.addEventListener('pointerleave', () => surface.classList.remove('is-lit'), { signal })
  }
}

export function initLife(signal: AbortSignal): void {
  playChat(signal)
  countUp(signal)
  glow(signal)
}
