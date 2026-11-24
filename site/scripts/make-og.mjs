// Builds the share images from site/design/og/og.html with the Chrome that is already on this machine.
// Run it from site/ after changing the design:  node scripts/make-og.mjs
import { execFileSync } from 'node:child_process'
import { existsSync, mkdirSync, rmSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join, resolve } from 'node:path'
import { pathToFileURL } from 'node:url'
import sharp from 'sharp'

const CHROME = [
  'C:/Program Files/Google/Chrome/Application/chrome.exe',
  'C:/Program Files (x86)/Google/Chrome/Application/chrome.exe',
  '/usr/bin/google-chrome',
  '/Applications/Google Chrome.app/Contents/MacOS/Google Chrome',
].find((path) => existsSync(path))
if (!CHROME) throw new Error('Chrome was not found.')

const page = pathToFileURL(resolve('design/og/og.html')).href
const dir = join(tmpdir(), 'kit-og')
mkdirSync(dir, { recursive: true })
const looks = { en: 'og', ar: 'og-ar', docs: 'og-docs', 'docs-ar': 'og-docs-ar' }

for (const [look, name] of Object.entries(looks)) {
  const png = join(dir, `${name}.png`)
  execFileSync(CHROME, [
    '--headless=new',
    '--disable-gpu',
    '--hide-scrollbars',
    '--force-device-scale-factor=1',
    '--window-size=1200,630',
    '--virtual-time-budget=4000',
    `--screenshot=${png}`,
    `${page}#${look}`,
  ])
  await sharp(png).jpeg({ quality: 88, mozjpeg: true }).toFile(resolve('public', `${name}.jpg`))
  console.log(`public/${name}.jpg`)
}
rmSync(dir, { recursive: true, force: true })
