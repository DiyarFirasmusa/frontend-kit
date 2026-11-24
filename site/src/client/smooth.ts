/**
 * A slow, soft scroll for a mouse wheel: each notch moves less and the page eases into place.
 * It does nothing on a touch screen, with reduced motion, or inside a box that scrolls on its own.
 */
const WHEEL_SPEED = 0.5
const EASE = 0.055
const LINK_MS = 1500

let target = 0
let current = 0
let running = false
let last = 0

const calm = (): boolean => matchMedia('(prefers-reduced-motion: reduce)').matches
const mouse = (): boolean => matchMedia('(hover: hover) and (pointer: fine)').matches
const limit = (): number => Math.max(0, document.documentElement.scrollHeight - innerHeight)
const clamp = (value: number): number => Math.min(Math.max(value, 0), limit())

/** An element under the pointer that can scroll by itself in this direction keeps the wheel for itself. */
function scrollsItself(start: EventTarget | null, down: boolean): boolean {
  let element = start instanceof Element ? start : null
  while (element && element !== document.body && element !== document.documentElement) {
    const style = getComputedStyle(element)
    const scrollable = /(auto|scroll)/.test(style.overflowY) && element.scrollHeight > element.clientHeight + 1
    if (scrollable) {
      const atTop = element.scrollTop <= 0
      const atBottom = element.scrollTop + element.clientHeight >= element.scrollHeight - 1
      if (down ? !atBottom : !atTop) return true
    }
    element = element.parentElement
  }
  return false
}

function frame(now: number): void {
  const step = Math.min(now - last, 50)
  last = now
  const remaining = target - current
  if (Math.abs(remaining) < 0.4) {
    current = target
    scrollTo(0, current)
    running = false
    return
  }
  // The same softness at any frame rate.
  current += remaining * (1 - (1 - EASE) ** (step / 16.67))
  scrollTo(0, current)
  requestAnimationFrame(frame)
}

function glide(): void {
  if (running) return
  running = true
  last = performance.now()
  current = scrollY
  requestAnimationFrame(frame)
}

/** A timed glide for links to a place on the same page: slow at both ends. */
function glideTo(y: number): void {
  const from = scrollY
  const to = clamp(y)
  const began = performance.now()
  target = to
  running = true
  const ease = (t: number): number => (t < 0.5 ? 4 * t ** 3 : 1 - (-2 * t + 2) ** 3 / 2)
  const step = (now: number): void => {
    const t = Math.min((now - began) / LINK_MS, 1)
    current = from + (to - from) * ease(t)
    scrollTo(0, current)
    if (t < 1 && running && target === to) requestAnimationFrame(step)
    else running = false
  }
  requestAnimationFrame(step)
}

export function initSmooth(): void {
  if (!mouse()) return
  target = current = scrollY

  addEventListener(
    'wheel',
    (event) => {
      if (event.ctrlKey || event.defaultPrevented || calm()) return
      if (Math.abs(event.deltaY) < Math.abs(event.deltaX)) return
      if (scrollsItself(event.target, event.deltaY > 0)) return
      event.preventDefault()
      const unit = event.deltaMode === 1 ? 16 : event.deltaMode === 2 ? innerHeight : 1
      target = clamp((running ? target : scrollY) + event.deltaY * unit * WHEEL_SPEED)
      glide()
    },
    { passive: false },
  )

  // Keys, the scrollbar and links the browser handles move the page by themselves: keep up with them.
  addEventListener(
    'scroll',
    () => {
      if (!running) target = current = scrollY
    },
    { passive: true },
  )

  document.addEventListener(
    'click',
    (event) => {
      if (calm() || event.defaultPrevented || event.button !== 0 || event.metaKey || event.ctrlKey || event.shiftKey) return
      const link = (event.target as Element | null)?.closest<HTMLAnchorElement>('a[href*="#"]')
      if (!link || link.pathname !== location.pathname || !link.hash || link.target) return
      const place = document.getElementById(decodeURIComponent(link.hash.slice(1)))
      if (!place) return
      event.preventDefault()
      event.stopPropagation()
      const bar = parseFloat(getComputedStyle(document.documentElement).scrollPaddingTop) || 76
      history.replaceState(null, '', link.hash)
      glideTo(place.getBoundingClientRect().top + scrollY - bar)
    },
    { capture: true },
  )

  document.addEventListener('astro:page-load', () => {
    running = false
    target = current = scrollY
  })
}
