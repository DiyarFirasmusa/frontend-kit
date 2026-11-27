import { all } from './dom.ts'

const calm = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches
const wait = (ms: number, signal: AbortSignal): Promise<void> =>
  new Promise((resolve) => {
    // Already stopped: nothing to wait for.
    if (signal.aborted) {
      resolve()
      return
    }
    const stop = (): void => {
      clearTimeout(timer)
      resolve()
    }
    const timer = setTimeout(() => {
      signal.removeEventListener('abort', stop)
      resolve()
    }, ms)
    signal.addEventListener('abort', stop, { once: true })
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
        chat.classList.toggle('is-paused', paused)
        document.documentElement.classList.toggle('is-paused', paused)
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
    // The first time through, the opening message is already sent, so the window is never an empty box.
    let opening = true
    while (!signal.aborted) {
      for (const event of events) event.classList.remove('is-in', 'is-picked')
      body.scrollTop = 0
      if (opening) events[0]?.classList.add('is-in')
      await pace(600)

      for (const event of events) {
        if (signal.aborted) return
        const kind = event.dataset['ev']
        if (opening && event === events[0]) continue
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
        } else if (kind === 'claude' || kind === 'ready' || kind === 'visual') {
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
          await pace(kind === 'ready' ? 6200 : kind === 'visual' ? 3200 : 450)
        }
      }
      opening = false
    }
  })()
}

export function initLife(signal: AbortSignal): void {
  playChat(signal)
}
