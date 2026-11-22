import type { Beat } from '../film/timeline.ts'
import { all } from './dom.ts'

/** How much of the flight happens while the end of the explanation is still leaving the screen. */
const OVERLAP = 0.3

export interface Moments {
  centres: number[]
  numbers: number[]
  elements: HTMLElement[]
}

export interface Measured {
  beats: Beat[]
  moments: Moments[]
}

/** Reads the page once, so that drawing a frame never has to. */
export function measure(sections: readonly HTMLElement[], screen: number): Measured {
  const beats = sections.map((section): Beat => {
    const hold = Number(section.dataset['hold'])
    const travel = Number(section.dataset['travel'])
    if (!section.querySelector('[data-tour]')) return { hold, reading: 0, travel }
    const total = section.offsetHeight / Math.max(1, screen)
    const flight = travel + OVERLAP
    return { hold, reading: Math.max(0.01, total - hold - flight), travel: flight }
  })
  const moments = sections.map((section): Moments => {
    const elements = all<HTMLElement>('[data-moment]', section)
    return {
      elements,
      numbers: elements.map((element) => Number(element.dataset['stop'] ?? -1)),
      centres: elements.map((element) => {
        const box = element.getBoundingClientRect()
        return box.top + scrollY + box.height / 2
      }),
    }
  })
  return { beats, moments }
}
