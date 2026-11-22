import { clamp } from '../../film/timeline.ts'
import { all } from '../dom.ts'
import { viewOf, type View } from './view.ts'

/** How much of a screen a cue holds still before and after the change into it. */
const REST = 0.45
/** Of the scroll between two cues, how much is the change itself. */
const REST_SHARE = 0.16

interface Cue {
  element: HTMLElement
  from: number
  until: number
}

/**
 * The page read as a score: each cue holds, and between two cues the scroll itself is the change. Shape and words are
 * both played from the one eased position, so they cannot drift apart.
 */
export class Score {
  private readonly cues: Cue[]
  private readonly written = new Map<HTMLElement, string>()

  constructor(elements: readonly HTMLElement[]) {
    this.cues = elements.map((element) => ({ element, from: 0, until: 0 }))
    this.measure()
  }

  /** Reads the page once, so that drawing a frame never has to. */
  measure(): void {
    for (const cue of this.cues) {
      const { top, bottom, height } = cue.element.getBoundingClientRect()
      const inset = Math.min(height / 2, innerHeight * REST)
      cue.from = top + scrollY + inset
      cue.until = Math.max(cue.from, bottom + scrollY - inset)
    }
  }

  /** Where the middle of the screen is, in cues. */
  position(): number {
    const middle = scrollY + innerHeight / 2
    const { cues } = this
    let i = 0
    while (i < cues.length - 1 && middle >= cues[i + 1]!.from) i++
    const next = cues[i + 1]
    if (!next) return i
    const way = (middle - cues[i]!.until) / Math.max(1, next.from - cues[i]!.until)
    return i + clamp((way - REST_SHARE) / (1 - REST_SHARE * 2))
  }

  viewAt(index: number): View {
    const cue = this.cues[Math.min(index, this.cues.length - 1)]
    return viewOf(cue?.element ?? document.body)
  }

  /** Gives the words of each cue how far in they are: gone when the blocks leave, whole when they land. */
  play(position: number): void {
    this.cues.forEach(({ element }, i) => {
      const shown = clamp(1 - (Math.abs(position - i) - 0.04) / 0.56).toFixed(3)
      if (this.written.get(element) === shown) return
      this.written.set(element, shown)
      element.style.setProperty('--shown', shown)
    })
  }

  release(): void {
    for (const { element } of this.cues) element.style.removeProperty('--shown')
    this.written.clear()
  }
}

/** The score of the page in view; a page without one is played by the clock. */
export function scoreOfPage(): Score | undefined {
  const scored = document.querySelector<HTMLElement>('[data-score]')
  if (!scored) return undefined
  const cues = all<HTMLElement>('[data-stage-shape]', scored)
  return cues.length > 0 ? new Score(cues) : undefined
}
