import { initAlive } from './alive.ts'
import { initCopy } from './copy-button.ts'
import { initTree } from './docs-tree.ts'
import { initExplorer } from './explorer.ts'
import { initFinder } from './finder.ts'
import { initGate } from './gate.ts'
import { initLife } from './life.ts'
import { initChrome } from './page-chrome.ts'
import { initTabs } from './tabs.ts'
import { initToc } from './toc.ts'
import { warmPages } from './warm.ts'
import { initWords } from './words.ts'

let page = new AbortController()

document.addEventListener('astro:page-load', () => {
  page.abort()
  page = new AbortController()
  initWords()
  initChrome(page.signal)
  initExplorer()
  initCopy()
  initFinder()
  initTree()
  initGate()
  initLife(page.signal)
  initTabs(page.signal)
  initAlive(page.signal)
  warmPages(page.signal)
  initToc(page.signal)
})
