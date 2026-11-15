// i18n validator shipped by frontend-kit. `npm run i18n:validate` runs it (Node strips the types: Node >= 22.18,
// keep this file erasable-syntax only, no dependencies).
//
// Checks, for every `src/**/locales/{ar,en}.json` bundle:
//   - both languages exist and hold the same keys (two levels: group.key, camelCase)
//   - plural suffixes are complete (both languages: _one and _other; Arabic _zero/_two/_few/_many are optional)
//   - {{variables}} match between languages; empty values are rejected
//   - a key lives in one bundle only
// and in code: every static t('group.key') exists, t() never gets a template literal
// (escape hatch: a trailing `// i18n-dynamic-ok` comment), and keys held in data
// (`successMessage`, `message`, `labelKey`) exist.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative } from 'node:path';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const KEY_PATTERN = /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*(_(zero|one|two|few|many|other))?$/;
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
// Arabic has six plural categories, but a missing one falls back to _other; require the two every sentence needs.
const ARABIC_FORMS = ['one', 'other'];
const ENGLISH_FORMS = ['one', 'other'];
const errors: string[] = [];
const warnings: string[] = [];

function walk(dir: string, visit: (file: string) => void): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, visit);
    } else {
      visit(full);
    }
  }
}

const rel = (file: string): string => relative(ROOT, file);

type Flat = Map<string, string>;

function flatten(file: string): Flat {
  const flat: Flat = new Map();
  const json: unknown = JSON.parse(readFileSync(file, 'utf8'));
  if (typeof json !== 'object' || json === null) {
    errors.push(`${rel(file)}: root must be an object`);
    return flat;
  }
  for (const [group, groupValue] of Object.entries(json)) {
    if (typeof groupValue !== 'object' || groupValue === null) {
      errors.push(`${rel(file)}: "${group}" must be a group object (keys are exactly group.key)`);
      continue;
    }
    for (const [name, value] of Object.entries(groupValue)) {
      const key = `${group}.${name}`;
      if (typeof value !== 'string') {
        errors.push(
          `${rel(file)}: "${key}" must be a string (found a third level or a non-string)`,
        );
      } else if (value.trim() === '') {
        errors.push(`${rel(file)}: "${key}" is empty`);
      } else {
        flat.set(key, value);
      }
      if (!KEY_PATTERN.test(key)) {
        errors.push(
          `${rel(file)}: "${key}" must be group.key in camelCase (plural suffixes allowed)`,
        );
      }
    }
  }
  return flat;
}

const baseOf = (key: string): string => key.replace(PLURAL_SUFFIX, '');
const varsOf = (text: string): string =>
  [...text.matchAll(/\{\{\s*(\w+)\s*\}\}/g)]
    .map((m) => m[1])
    .sort()
    .join(',');

// 1. Collect bundles: the global one and one per feature folder.
const bundles = new Map<string, { ar?: string; en?: string }>();
walk(SRC, (file) => {
  const match = /(^|\/)locales\/(ar|en)\.json$/.exec(file);
  if (match) {
    const dir = file.slice(0, file.length - `${match[2]}.json`.length);
    const entry = bundles.get(dir) ?? {};
    entry[match[2] === 'ar' ? 'ar' : 'en'] = file;
    bundles.set(dir, entry);
  }
});

const allKeys = new Map<string, string>(); // full key → bundle dir
const definedBases = new Set<string>();

for (const [dir, files] of bundles) {
  if (!files.ar || !files.en) {
    errors.push(`${rel(dir)}: needs both ar.json and en.json`);
    continue;
  }
  const ar = flatten(files.ar);
  const en = flatten(files.en);

  const arBases = new Set([...ar.keys()].map(baseOf));
  const enBases = new Set([...en.keys()].map(baseOf));
  for (const base of arBases) {
    if (!enBases.has(base)) {
      errors.push(`${rel(dir)}: "${base}" is in ar.json but missing from en.json`);
    }
  }
  for (const base of enBases) {
    if (!arBases.has(base)) {
      errors.push(`${rel(dir)}: "${base}" is in en.json but missing from ar.json`);
    }
  }

  // Plural forms: a base with any suffix needs the language's full set.
  for (const [language, flat, forms] of [
    ['ar', ar, ARABIC_FORMS],
    ['en', en, ENGLISH_FORMS],
  ] as const) {
    const pluralBases = new Set(
      [...flat.keys()].filter((key) => PLURAL_SUFFIX.test(key)).map(baseOf),
    );
    for (const base of pluralBases) {
      for (const form of forms) {
        if (!flat.has(`${base}_${form}`)) {
          errors.push(`${rel(dir)}: ${language} "${base}" is missing plural form _${form}`);
        }
      }
    }
  }

  // Interpolation variables must match across languages.
  for (const [key, arText] of ar) {
    const enText = en.get(key) ?? en.get(`${baseOf(key)}_other`);
    if (enText !== undefined && varsOf(arText) !== varsOf(enText) && !PLURAL_SUFFIX.test(key)) {
      errors.push(`${rel(dir)}: "${key}" uses different {{variables}} in ar and en`);
    }
  }

  for (const key of new Set([...ar.keys(), ...en.keys()])) {
    const previous = allKeys.get(key);
    if (previous !== undefined && previous !== dir) {
      errors.push(`"${key}" is defined in two bundles: ${rel(previous)} and ${rel(dir)}`);
    }
    allKeys.set(key, dir);
    definedBases.add(baseOf(key));
  }
}

// 2. Every key the code names exists; no dynamic keys.
const usedBases = new Set<string>();
const STATIC_CALL = /(?<![\w$])(?:[\w$]+\.)?t\(\s*(['"])([^'"]+)\1/g;
// A template literal builds a key at runtime. A bare identifier is a key held in data (zod message, successMessage,
// a map of keys): allowed, and the quoted-string scan below proves each such key exists.
const DYNAMIC_CALL = /(?<![\w$])(?:[\w$]+\.)?t\(\s*`[^`]*\$\{/g;
const SUCCESS_MESSAGE =
  /(?:successMessage|message|labelKey):\s*'([a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9_]*)'/g;
walk(SRC, (file) => {
  if (!/\.(ts|tsx)$/.test(file) || /\.test\.tsx?$/.test(file) || file.includes('/src/test/')) {
    return;
  }
  const text = readFileSync(file, 'utf8');
  const lines = text.split('\n');
  for (const [index, line] of lines.entries()) {
    for (const match of line.matchAll(STATIC_CALL)) {
      const key = match[2] ?? '';
      if (!/^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*$/.test(key)) {
        continue;
      }
      usedBases.add(key);
      if (!definedBases.has(key)) {
        errors.push(`${rel(file)}:${index + 1}: key "${key}" is not defined in any locale bundle`);
      }
    }
    for (const match of line.matchAll(SUCCESS_MESSAGE)) {
      const key = match[1] ?? '';
      usedBases.add(key);
      if (!definedBases.has(key)) {
        errors.push(`${rel(file)}:${index + 1}: key "${key}" is not defined in any locale bundle`);
      }
    }
    // Any quoted string shaped like a defined key counts as a use (ternaries, maps of keys).
    for (const match of line.matchAll(/(['"])([a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9_]*)\1/g)) {
      if (definedBases.has(match[2] ?? '')) {
        usedBases.add(match[2] ?? '');
      }
    }
    if (DYNAMIC_CALL.test(line) && !line.includes('i18n-dynamic-ok')) {
      errors.push(
        `${rel(file)}:${index + 1}: t() needs a static string key (no template literal); keys held in data are fine`,
      );
    }
    DYNAMIC_CALL.lastIndex = 0;
  }
});

for (const base of definedBases) {
  if (!usedBases.has(base)) {
    warnings.push(`unused key: ${base}`);
  }
}

for (const warning of warnings) {
  console.warn(`warn  ${warning}`);
}
if (errors.length > 0) {
  for (const error of errors) {
    console.error(`error ${error}`);
  }
  console.error(`\ni18n:validate failed with ${errors.length} problem(s)`);
  process.exit(1);
}
console.log(
  `i18n:validate ok: ${bundles.size} bundle(s), ${allKeys.size} keys, ar/en parity, ${usedBases.size} keys used in code`,
);
