import { all } from './dom.ts'

/**
 * The small loops on the home page (a cursor pressing a button, bars filling, checks appearing) run only while
 * their part is on screen. `has-started` stays once it was seen, so a loop resumes where it was, not from blank.
 */
export function initAlive(signal: AbortSignal): void {
  if (matchMedia('(prefers-reduced-motion: reduce)').matches) return
  const parts = all<HTMLElement>('[data-alive]')
  if (parts.length === 0) return
  const watcher = new IntersectionObserver(
    (entries) => {
      for (const { target, isIntersecting } of entries) {
        target.classList.toggle('is-alive', isIntersecting)
        if (isIntersecting) target.classList.add('has-started')
      }
    },
    { threshold: 0.25 },
  )
  for (const part of parts) watcher.observe(part)
  signal.addEventListener('abort', () => watcher.disconnect())
}
