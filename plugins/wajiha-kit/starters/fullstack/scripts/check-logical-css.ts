// Fails on physical (left/right) CSS in source files. The site is RTL and LTR, so spacing, position,
// alignment, borders and radius must use logical names (start/end, inline). Run: npm run check:css
// Node strips the types: keep this file erasable-syntax only.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';

// Tailwind utilities: pl-4, pr-2, ml-auto, mr-3, left-0, right-0, text-left, border-l, rounded-tl-lg ...
const TAILWIND = [
  /(?<![\w-])-?(?:pl|pr|ml|mr)-(?:\d|px|auto|\[)/,
  /(?<![\w-])-?(?:left|right)-(?:\d|px|auto|full|\[|1\/)/,
  /(?<![\w-])text-(?:left|right)(?![\w-])/,
  /(?<![\w-])float-(?:left|right)(?![\w-])/,
  /(?<![\w-])border-[lr](?:-|(?![\w-]))/,
  /(?<![\w-])rounded-(?:[lr]|t[lr]|b[lr])(?:-|(?![\w-]))/,
  /(?<![\w-])(?:scroll-[mp][lr]|space-x-reverse)/,
];

// Plain CSS properties and values.
const CSS = [
  /(?<![\w-])(?:margin|padding)-(?:left|right)\s*:/,
  /(?<![\w-])border-(?:left|right)(?:-\w+)?\s*:/,
  /(?<![\w-])border-(?:top|bottom)-(?:left|right)-radius\s*:/,
  /(?<![\w-])(?:left|right)\s*:\s*(?:-?\d|auto|var)/,
  /text-align\s*:\s*(?:left|right)/,
  /(?<![\w-])float\s*:\s*(?:left|right)/,
];

const ROOT = process.cwd();
const FILE = /\.(tsx|ts|css)$/;
const problems: string[] = [];

function walk(dir: string, visit: (file: string) => void): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, visit);
    } else {
      visit(full.split(sep).join('/'));
    }
  }
}

walk(join(ROOT, 'src'), (file) => {
  if (!FILE.test(file) || file.endsWith('routeTree.gen.ts') || /\.test\.tsx?$/.test(file)) {
    return;
  }
  const lines = readFileSync(file, 'utf8').split('\n');
  for (const [index, line] of lines.entries()) {
    // A line may opt out when a direction really is physical (a map, a chart): `// physical-css-ok: why`.
    if (line.includes('physical-css-ok')) {
      continue;
    }
    const patterns = file.endsWith('.css') ? CSS : [...TAILWIND, ...CSS];
    for (const pattern of patterns) {
      const match = pattern.exec(line);
      if (match !== null) {
        problems.push(
          `${relative(ROOT, file)}:${index + 1}: "${match[0].trim()}" is physical; use the logical name (ps-/pe-/ms-/me-/start-/end-/text-start/border-s/rounded-s)`,
        );
      }
    }
  }
});

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`error ${problem}`);
  }
  console.error(`\ncheck:css failed with ${problems.length} problem(s)`);
  process.exit(1);
}
console.log('check:css ok: no physical left/right CSS in src');
