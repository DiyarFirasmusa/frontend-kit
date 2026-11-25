// Builds the share images from site/design/og/og.html with the Chrome that is already on this machine.
// Run it from site/ after `npm run build` (the page images read each page's title from dist/):
//   node scripts/make-og.mjs
import { execFileSync } from 'node:child_process'
import { copyFileSync, existsSync, mkdirSync, readFileSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

const CHROME = [
  process.env.CHROME,
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((path) => path && existsSync(path))
if (!CHROME) throw new Error('Chrome was not found. Set CHROME to the browser path.')

const page = pathToFileURL(resolve('design/og/og.html')).href
const dir = join(tmpdir(), 'kit-og')
mkdirSync(dir, { recursive: true })
mkdirSync(resolve('public/og'), { recursive: true })

async function shoot(hash, out) {
  const png = join(dir, 'shot.png')
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=4000',
    `--screenshot=${png}`,
    `${page}#${hash}`,
  ], { timeout: 60000 })
  await sharp(png).jpeg({ quality: 86, mozjpeg: true }).toFile(resolve('public', out))
  console.log(`public/${out}`)
}

// The home page, in each language.
await shoot('en', 'og.jpg')
await shoot('ar', 'og-ar.jpg')

// One image for each page of the guide, in each language, with its own title, words and colour.
const PAGES = ['docs', 'guide', 'get-started', 'project-types', 'examples', 'questions', 'changelog', 'skills', 'agents', 'rules', 'checks', 'features', 'modes', 'configuration', 'refactor', 'licence', 'privacy', 'terms']
const COLOURS = { skills: '#d97757', rules: '#f2a183', agents: '#57cdcd', checks: '#19abab' }
const text = (html) =>
  html
    .replace(/<[^>]+>/g, '')
    .replace(/&amp;/g, '&')
    .replace(/&quot;/g, '"')
    .replace(/&#39;/g, "'")
    .replace(/\s+/g, ' ')
    .trim()
const pick = (html, pattern) => text(html.match(pattern)?.[1] ?? '')

for (const id of PAGES) {
  for (const ar of [false, true]) {
    const file = resolve('dist', ar ? 'ar' : '', id, 'index.html')
    if (!existsSync(file)) throw new Error(`Build the site first: ${file} is missing.`)
    const html = readFileSync(file, 'utf8')
    const look = {
      dir: ar ? 'rtl' : 'ltr',
      title: pick(html, /<h1[^>]*>([\s\S]*?)<\/h1>/),
      lead: pick(html, /<p class="doc-summary"[^>]*>([\s\S]*?)<\/p>/),
      eyebrow: pick(html, /<p class="doc-eyebrow"[^>]*>([\s\S]*?)<\/p>/),
      colour: COLOURS[id] ?? '#19abab',
    }
    await shoot(`page=${encodeURIComponent(JSON.stringify(look))}`, `og/${id}${ar ? '-ar' : ''}.jpg`)
  }
}
rmSync(dir, { recursive: true, force: true })

// The visual identity keeps the covers too (brand/wajiha-identity.html shows them).
const covers = resolve('../brand/cover')
mkdirSync(covers, { recursive: true })
for (const [from, to] of [['og.jpg', 'cover.jpg'], ['og-ar.jpg', 'cover-ar.jpg'], ['og/skills.jpg', 'cover-page.jpg'], ['og/questions-ar.jpg', 'cover-page-ar.jpg']]) {
  copyFileSync(resolve('public', from), join(covers, to))
  console.log(`brand/cover/${to}`)
}
