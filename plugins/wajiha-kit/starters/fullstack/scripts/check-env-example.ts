// Fails when .env.example and the env schema list different keys, or when a secret-looking key is public.
// Node strips the types: keep this file erasable-syntax only. Run: npm run check:env
import { readFileSync } from 'node:fs';
import { ENV_KEYS } from '../src/shared/env/schema.ts';

const text = readFileSync('.env.example', 'utf8');
const documented = new Set(
  text
    .split(/\r?\n/)
    .filter((line) => !line.trimStart().startsWith('#'))
    .map((line) => /^([A-Z][A-Z0-9_]*)=/.exec(line)?.[1])
    .filter((key): key is string => key !== undefined),
);

const problems: string[] = [];
for (const key of ENV_KEYS) {
  if (!documented.has(key)) {
    problems.push(`${key} is in the schema but missing from .env.example`);
  }
}
for (const key of documented) {
  if (!ENV_KEYS.includes(key)) {
    problems.push(`${key} is in .env.example but not in the schema (src/shared/env/schema.ts)`);
  }
  if (key.startsWith('VITE_') && /(SECRET|TOKEN|PASSWORD|PRIVATE|API_KEY)/.test(key)) {
    problems.push(`${key} looks like a secret but VITE_* values are shipped to the browser`);
  }
}

if (problems.length > 0) {
  for (const problem of problems) {
    console.error(`error ${problem}`);
  }
  process.exit(1);
}
console.log(`check:env ok: ${ENV_KEYS.length} keys in the schema and in .env.example`);
