import { initCopy } from './copy-button.ts'
import { initTree } from './docs-tree.ts'
import { initExample } from './example.ts'
import { initExplorer } from './explorer.ts'
import { initFinder } from './finder.ts'
import { initGate } from './gate.ts'
import { initChrome } from './page-chrome.ts'
import { initReveal } from './reveal.ts'
import { initWords } from './words.ts'

let page = new AbortController()

document.addEventListener('astro:page-load', () => {
  page.abort()
  page = new AbortController()
  initWords()
  initChrome(page.signal)
  initExample(page.signal)
  initExplorer()
  initCopy()
  initFinder()
  initTree()
  initReveal(page.signal)
  initGate()
})
