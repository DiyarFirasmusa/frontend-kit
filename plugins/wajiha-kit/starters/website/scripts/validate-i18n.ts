// i18n validator shipped by wajiha-kit. `npm run i18n:validate` runs it (Node strips the types: Node >= 22.18,
// keep this file erasable-syntax only, no dependencies beyond the language registry).
//
// Checks, for every `src/**/locales/<language>.json` bundle (the languages are LOCALES in languages.ts):
//   - the file name is a registered language, and a folder has a file for every language
//   - every language holds the same keys as the default one (two levels: group.key, camelCase)
//   - plural suffixes are complete (_one and _other; an Arabic counted noun needs all six, which no script can detect)
//   - {{variables}} match between languages; empty values are rejected
//   - a key lives in one bundle only, and so does a group name (a shared group hides which file owns a key)
//   - registration: resources.ts loads bundles by the glob (so none is forgotten) and the typed-key file lists each one
// and in code: every static t('group.key') exists, t() never gets a template literal
// (escape hatch: a trailing `// i18n-dynamic-ok` comment), and keys held in data
// (`successMessage`, `message`, `labelKey`) exist.
import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { DEFAULT_LOCALE, LOCALES } from '../src/shared/lib/i18n/languages.ts';

const ROOT = process.cwd();
const SRC = join(ROOT, 'src');
const KEY_PATTERN = /^[a-z][a-zA-Z0-9]*\.[a-z][a-zA-Z0-9]*(_(zero|one|two|few|many|other))?$/;
const PLURAL_SUFFIX = /_(zero|one|two|few|many|other)$/;
// A missing category falls back to _other, so only these two are required; counted nouns need all six (i18n-rtl.md).
const REQUIRED_FORMS = ['one', 'other'];
const RESOURCES_FILE = join(SRC, 'shared', 'lib', 'i18n', 'resources.ts');
const KEY_TYPES_FILE = join(SRC, 'shared', 'lib', 'i18n', 'i18next.d.ts');
const errors: string[] = [];
const warnings: string[] = [];

function walk(dir: string, visit: (file: string) => void): void {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, visit);
    } else {
      // Forward slashes on every OS, so the path patterns below also match on Windows.
      visit(full.split(sep).join('/'));
    }
  }
}

const rel = (file: string): string => relative(ROOT, file).split(sep).join('/');

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
  [...new Set([...text.matchAll(/\{\{\s*-?\s*(\w+)/g)].map((m) => m[1]))].toSorted().join(',');
const textOf = (flat: Flat, base: string): string =>
  [...flat]
    .filter(([key]) => baseOf(key) === base)
    .map(([, text]) => text)
    .join(' ');
const isRegistered = (language: string): boolean =>
  (LOCALES as readonly string[]).includes(language);

// 1. Collect bundles: the global one and one per feature folder. Any `<language>.json` counts, so a file
// for a language that is not in LOCALES is reported instead of being ignored.
const bundles = new Map<string, Map<string, string>>();
walk(SRC, (file) => {
  const match = /^(.*\/locales)\/([^/]+)\.json$/.exec(file);
  if (match) {
    const dir = match[1] ?? '';
    const files = bundles.get(dir) ?? new Map<string, string>();
    files.set(match[2] ?? '', file);
    bundles.set(dir, files);
  }
});

const allKeys = new Map<string, string>(); // full key → bundle dir
const groupOwner = new Map<string, string>(); // group name → bundle dir
const definedBases = new Set<string>();

for (const [dir, files] of bundles) {
  for (const language of files.keys()) {
    if (!isRegistered(language)) {
      errors.push(
        `${rel(dir)}/${language}.json: "${language}" is not in LOCALES (src/shared/lib/i18n/languages.ts)`,
      );
    }
  }
  const missing = LOCALES.filter((locale) => !files.has(locale));
  if (missing.length > 0) {
    errors.push(
      `${rel(dir)}: needs a file for every language, missing ${missing.map((l) => `${l}.json`).join(', ')}`,
    );
    continue;
  }

  const flats = new Map(LOCALES.map((locale) => [locale, flatten(files.get(locale) ?? '')]));
  const base = flats.get(DEFAULT_LOCALE) ?? new Map<string, string>();
  const baseBases = new Set([...base.keys()].map(baseOf));

  for (const [locale, flat] of flats) {
    if (locale !== DEFAULT_LOCALE) {
      const bases = new Set([...flat.keys()].map(baseOf));
      for (const name of baseBases) {
        if (!bases.has(name)) {
          errors.push(
            `${rel(dir)}: "${name}" is in ${DEFAULT_LOCALE}.json but missing from ${locale}.json`,
          );
        }
      }
      for (const name of bases) {
        if (!baseBases.has(name)) {
          errors.push(
            `${rel(dir)}: "${name}" is in ${locale}.json but missing from ${DEFAULT_LOCALE}.json`,
          );
        } else if (varsOf(textOf(base, name)) !== varsOf(textOf(flat, name))) {
          // A plural key counts as one: one form may leave {{count}} out.
          errors.push(
            `${rel(dir)}: "${name}" uses different {{variables}} in ${DEFAULT_LOCALE} and ${locale}`,
          );
        }
      }
    }
    // Plural forms: a base with any suffix needs the required set.
    const pluralBases = new Set(
      [...flat.keys()].filter((key) => PLURAL_SUFFIX.test(key)).map(baseOf),
    );
    for (const name of pluralBases) {
      for (const form of REQUIRED_FORMS) {
        if (!flat.has(`${name}_${form}`)) {
          errors.push(`${rel(dir)}: ${locale} "${name}" is missing plural form _${form}`);
        }
      }
    }
  }

  const keys = new Set<string>();
  for (const flat of flats.values()) {
    for (const key of flat.keys()) {
      keys.add(key);
    }
  }
  for (const key of keys) {
    const previous = allKeys.get(key);
    if (previous !== undefined && previous !== dir) {
      errors.push(`"${key}" is defined in two bundles: ${rel(previous)} and ${rel(dir)}`);
    }
    allKeys.set(key, dir);
    definedBases.add(baseOf(key));
    const group = key.slice(0, key.indexOf('.'));
    const owner = groupOwner.get(group);
    if (owner !== undefined && owner !== dir) {
      errors.push(
        `group "${group}" is in two bundles (${rel(owner)} and ${rel(dir)}): a group name lives in one bundle only`,
      );
    }
    groupOwner.set(group, dir);
  }
}

// Registration: bundles are loaded by one glob and typed from one file, so check both stay generic.
const GLOB = /import\.meta\.glob[^(]*\(\s*'\/src\/\*\*\/locales\/\*\.json'/;
if (!GLOB.test(readFileSync(RESOURCES_FILE, 'utf8'))) {
  errors.push(
    `${rel(RESOURCES_FILE)}: must load bundles with import.meta.glob('/src/**/locales/*.json'), so no bundle is forgotten`,
  );
}
let keyTypes = '';
try {
  keyTypes = readFileSync(KEY_TYPES_FILE, 'utf8');
} catch {
  errors.push(
    `${rel(KEY_TYPES_FILE)}: missing (it types t() keys from the ${DEFAULT_LOCALE} bundles)`,
  );
}
if (keyTypes !== '') {
  for (const [dir, files] of bundles) {
    const file = files.get(DEFAULT_LOCALE);
    const alias = file === undefined ? '' : `@/${relative(SRC, file).split(sep).join('/')}`;
    if (alias !== '' && !keyTypes.includes(`'${alias}'`)) {
      errors.push(
        `${rel(KEY_TYPES_FILE)}: does not list ${rel(dir)}/${DEFAULT_LOCALE}.json ('${alias}'), so its keys are not typed`,
      );
    }
  }
}

// 2. Every key the code names exists; no dynamic keys.
const usedBases = new Set<string>();
const STATIC_CALL = /(?<![\w$])(?:(?:[\w$]+\.)?t\(\s*|i18nKey=\{?\s*)(['"])([^'"]+)\1/g;
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
  `i18n:validate ok: ${bundles.size} bundle(s), ${allKeys.size} keys, ${LOCALES.join('/')} parity, ${usedBases.size} keys used in code`,
);
