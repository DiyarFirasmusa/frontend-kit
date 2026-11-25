import { initAlive } from './alive.ts'
import { initCopy } from './copy-button.ts'
import { initTree } from './docs-tree.ts'
import { initExplorer } from './explorer.ts'
import { initFinder } from './finder.ts'
import { initGate } from './gate.ts'
import { initLife } from './life.ts'
import { initBeforeAfter } from './before-after.ts'
import { initChrome } from './page-chrome.ts'
import { initTabs } from './tabs.ts'
import { initToc } from './toc.ts'
import { initTopSearch } from './top-search.ts'
import { warmPages } from './warm.ts'

let page = new AbortController()

document.addEventListener('astro:page-load', () => {
  page.abort()
  page = new AbortController()
  initChrome(page.signal)
  initExplorer()
  initCopy()
  initFinder()
  initTree(page.signal)
  initGate()
  initLife(page.signal)
  initTabs(page.signal)
  initAlive(page.signal)
  warmPages(page.signal)
  initToc(page.signal)
  initTopSearch(page.signal)
  initBeforeAfter(page.signal)
})
