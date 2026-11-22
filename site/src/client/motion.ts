const KEY = 'kit-motion'

export function saveChoice(on: boolean): void {
  try {
    localStorage.setItem(KEY, on ? 'on' : 'off')
  } catch {
    // Storage is blocked: the choice still holds for this visit.
  }
}

export function hasChoice(): boolean {
  try {
    return localStorage.getItem(KEY) !== null
  } catch {
    return false
  }
}

/** The pause button reads what a press would do. */
export function showMotion(button: HTMLButtonElement, playing: boolean): void {
  const label = (playing ? button.dataset['pause'] : button.dataset['play']) ?? ''
  button.title = label
  button.classList.toggle('is-paused', !playing)
  const text = button.querySelector('span')
  if (text) text.textContent = label
}
