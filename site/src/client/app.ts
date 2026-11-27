import { initAlive } from './alive.ts'
import { initBoardLife } from './board-life.ts'
import { initCopy } from './copy-button.ts'
import { initTree } from './docs-tree.ts'
import { initExternalLinks } from './external-links.ts'
import { initFinder } from './finder.ts'
import { initGate } from './gate.ts'
import { initLife } from './life.ts'
import { initBeforeAfter } from './before-after.ts'
import { initChrome } from './page-chrome.ts'
import { initShareLink } from './share-link.ts'
import { initPointer } from './pointer.ts'
import { initReveal } from './reveal.ts'
import { initTilt } from './tilt.ts'
import { initTabs } from './tabs.ts'
import { initToc } from './toc.ts'
import { initTopSearch } from './top-search.ts'
import { warmPages } from './warm.ts'

let page = new AbortController()

document.addEventListener('astro:page-load', () => {
  page.abort()
  page = new AbortController()
  const { signal } = page
  const starters: [string, () => void][] = [
    ['chrome', () => initChrome(signal)],
    ['copy', initCopy],
    ['external', initExternalLinks],
    ['finder', initFinder],
    ['tree', () => initTree(signal)],
    ['gate', initGate],
    ['life', () => initLife(signal)],
    ['tabs', () => initTabs(signal)],
    ['alive', () => initAlive(signal)],
    ['warm', () => warmPages(signal)],
    ['toc', () => initToc(signal)],
    ['search', () => initTopSearch(signal)],
    ['slider', () => initBeforeAfter(signal)],
    ['share', () => initShareLink(signal)],
    ['boards', () => initBoardLife(signal)],
    ['reveal', () => initReveal(signal)],
    ['pointer', () => initPointer(signal)],
    ['tilt', () => initTilt(signal)],
  ]
  for (const [name, start] of starters) {
    try {
      start()
    } catch (error) {
      console.error(`Wajiha Kit: the ${name} script did not start`, error)
    }
  }
})
