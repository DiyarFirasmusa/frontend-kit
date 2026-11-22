import { redraw } from './events.ts'

const KEY = 'kit-motion'
const reduced = matchMedia('(prefers-reduced-motion: reduce)')

function savedChoice(): string | null {
  try {
    return localStorage.getItem(KEY)
  } catch {
    return null // storage is blocked: follow the system setting
  }
}

let choice = savedChoice()

export function motionAllowed(): boolean {
  return choice ? choice === 'on' : !reduced.matches
}

export function initMotion(): void {
  const button = document.querySelector<HTMLButtonElement>('[data-motion]')
  const show = (): void => {
    const on = motionAllowed()
    document.documentElement.classList.toggle('still', !on)
    const label = button?.querySelector('span')
    if (button && label) label.textContent = (on ? button.dataset.pause : button.dataset.play) ?? ''
    redraw()
  }
  button?.addEventListener('click', () => {
    choice = motionAllowed() ? 'off' : 'on'
    try {
      localStorage.setItem(KEY, choice)
    } catch {
      // Not saved; the choice still holds for this visit.
    }
    show()
  })
  reduced.addEventListener('change', show)
  show()
}
