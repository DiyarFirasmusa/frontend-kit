/** Clicking a skill snaps it off its runner and shows what it does. */
export function initCatalogue(): void {
  const section = document.querySelector<HTMLElement>('#parts')
  const detail = section?.querySelector<HTMLElement>('[data-detail]')
  if (!section || !detail) return
  const parts = [...section.querySelectorAll<HTMLButtonElement>('[data-part]')]

  for (const part of parts) {
    part.addEventListener('click', () => {
      for (const other of parts) other.setAttribute('aria-pressed', String(other === part))
      const { code = '', name = '', what = '', how = '', tone = '' } = part.dataset
      detail.dataset.tone = tone
      detail.querySelector('[data-code]')!.textContent = code
      detail.querySelector('[data-name]')!.textContent = name
      detail.querySelector('[data-what]')!.textContent = what
      detail.querySelector('[data-how]')!.textContent = how
      detail.querySelector('[data-command]')!.textContent = `/frontend-kit:${name}`
    })
  }
}
