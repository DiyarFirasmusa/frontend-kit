import { all } from './dom.ts'

const LATIN = /^[\p{Script=Latin}\d]/u

/** Cuts the headings into words that can rise one after another. */
export function initWords(): void {
  for (const heading of all<HTMLElement>('[data-rise]')) {
    if (heading.querySelector('.rise')) continue
    const words = (heading.textContent ?? '').trim().split(' ')
    // Neighbouring Latin words stay one piece, or right-to-left text would turn their order round.
    const pieces: string[] = []
    for (const word of words) {
      const last = pieces.at(-1)
      if (document.documentElement.dir === 'rtl' && last && LATIN.test(last) && LATIN.test(word)) pieces[pieces.length - 1] = `${last} ${word}`
      else pieces.push(word)
    }
    heading.replaceChildren(
      ...pieces.flatMap((piece, i) => {
        const span = document.createElement('span')
        span.className = 'rise'
        span.textContent = piece
        span.style.setProperty('--w', String(i / Math.max(1, pieces.length - 1)))
        return i > 0 ? [' ', span] : [span]
      }),
    )
  }
}
