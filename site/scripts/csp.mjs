// The Content-Security-Policy allows the site's own files and the few small inline scripts by their hash.
// `node scripts/csp.mjs` writes the policy into vercel.json from the built pages in dist/.
// `node scripts/csp.mjs --check` fails when vercel.json does not match the built pages (run in CI after the build),
// so an edited inline script can never be silently blocked in production.
import { createHash } from 'node:crypto'
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'

const dist = new URL('../dist/', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')
const config = new URL('../vercel.json', import.meta.url).pathname.replace(/^\/([A-Za-z]:)/, '$1')

const hashes = new Set()
const walk = (dir) => {
  for (const name of readdirSync(dir)) {
    const path = join(dir, name)
    if (statSync(path).isDirectory()) walk(path)
    else if (path.endsWith('.html')) {
      const html = readFileSync(path, 'utf8')
      for (const [, attrs, body] of html.matchAll(/<script(?![^>]*\bsrc=)([^>]*)>([\s\S]*?)<\/script>/g)) {
        if (/application\/ld\+json/.test(attrs)) continue
        hashes.add(`'sha256-${createHash('sha256').update(body).digest('base64')}'`)
      }
    }
  }
}
walk(dist)

const policy = [
  "default-src 'self'",
  `script-src 'self' ${[...hashes].sort().join(' ')}`,
  "style-src 'self' 'unsafe-inline'",
  "img-src 'self' data:",
  "font-src 'self'",
  "connect-src 'self'",
  "frame-ancestors 'none'",
  "base-uri 'self'",
  "form-action 'self'",
  "object-src 'none'",
].join('; ')

const json = JSON.parse(readFileSync(config, 'utf8'))
const all = json.headers.find((entry) => entry.source === '/(.*)')
const current = all.headers.find((header) => header.key === 'Content-Security-Policy')

if (process.argv.includes('--check')) {
  if (current?.value !== policy) {
    console.error('vercel.json does not allow the inline scripts of this build. Run: node scripts/csp.mjs')
    process.exit(1)
  }
  console.log(`CSP matches the build (${hashes.size} inline scripts).`)
} else {
  all.headers = all.headers.filter((header) => !header.key.startsWith('Content-Security-Policy'))
  all.headers.push({ key: 'Content-Security-Policy', value: policy })
  writeFileSync(config, JSON.stringify(json, null, 2) + '\n')
  console.log(`Wrote the CSP with ${hashes.size} inline script hashes.`)
}
