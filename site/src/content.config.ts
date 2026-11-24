import { defineCollection } from 'astro:content'
import { globSync, readFileSync } from 'node:fs'
import { dirname, posix, resolve } from 'node:path'

const PLUGIN = 'plugins/wajiha-kit'
const ROOT = resolve(process.cwd(), '..')
const BLOB = 'https://github.com/DiyarFirasmusa/wajiha-kit/blob/main/'

/** Placeholders such as <name> are words, not tags. Code keeps its own, also when a span of it wraps a line. */
function tagsAsWords(markdown: string): string {
  const out: string[] = []
  let words: string[] = []
  let fence: string | undefined
  const flush = (): void => {
    if (words.length === 0) return
    out.push(words.join('\n').replace(/(`+)(?:(?!\n[ \t]*\n)[\s\S])*?\1|</g, (part) => (part === '<' ? '&lt;' : part)))
    words = []
  }
  for (const line of markdown.split('\n')) {
    const mark = /^\s*(`{3,}|~{3,})/.exec(line)?.[1]
    if (mark && (!fence || line.trim().startsWith(fence))) {
      flush()
      fence = fence ? undefined : mark
      out.push(line)
    } else if (fence) out.push(line)
    else words.push(line)
  }
  flush()
  return out.join('\n')
}

/** Fits a file into a page of the site: lower headings, its links on GitHub, wide things scroll on their own. */
function asSection(html: string, file: string): string {
  return html
    .replace(/<(\/?)h([1-6])\b[^>]*>/g, (_, close: string, level: string) => `<${close}h${Math.max(3, Math.min(5, Number(level) + 1))}>`)
    .replace(/href="([^"]+)"/g, (all, href: string) =>
      /^[a-z]+:/i.test(href) ? all : `href="${BLOB}${href.startsWith('#') ? file + href : posix.normalize(posix.join(dirname(file), href))}"`,
    )
    // A checklist of a source is read here, not ticked.
    .replace(/<input[^>]*>\s*/g, '')
    .replace(/<pre[^>]*>/g, '<pre tabindex="0">')
    .replaceAll('<table>', '<div class="wide" tabindex="0" role="group" aria-label="Table"><table>')
    .replaceAll('</table>', '</table></div>')
}

const reference = defineCollection({
  loader: {
    name: 'plugin-files',
    load: async ({ store, renderMarkdown }) => {
      const files = [
        'CHANGELOG.md',
        ...['skills/**/*.md', 'agents/*.md', 'templates/**/rules/*.md', 'output-styles/*.md'].flatMap((pattern) => globSync(`${PLUGIN}/${pattern}`, { cwd: ROOT }).map((file) => file.replaceAll('\\', '/'))),
      ]
      store.clear()
      for (const file of files) {
        const body = readFileSync(resolve(ROOT, file), 'utf8').replace(/^---\n[\s\S]*?\n---\n/, '')
        const { html } = await renderMarkdown(tagsAsWords(body))
        store.set({ id: file, data: {}, rendered: { html: asSection(html, file) } })
      }
    },
  },
})

export const collections = { reference }
