import { readdirSync, readFileSync, statSync } from 'node:fs';
import { join, relative, sep } from 'node:path';
import { describe, expect, it } from 'vitest';

/**
 * Two mutation conventions that jsdom behaviour tests only catch by luck:
 * every submit handler uses the shared single-flight guard (a render-time
 * `isPending` lets quick taps through), and a delete never removes a query a
 * mounted component may still watch (it would fetch the deleted record).
 */

const SRC = join(__dirname, '..');

function walk(dir: string, found: string[] = []): string[] {
  for (const name of readdirSync(dir)) {
    const full = join(dir, name);
    if (statSync(full).isDirectory()) {
      walk(full, found);
    } else if (/\.tsx?$/u.test(name) && !/\.test\.tsx?$/u.test(name)) {
      found.push(full);
    }
  }
  return found;
}

const files = walk(SRC).map((full) => ({
  path: relative(SRC, full).split(sep).join('/'),
  text: readFileSync(full, 'utf-8'),
}));

const SUBMIT_FILE =
  /(form-dialog|-manager|use-add-member-form|use-delete-dialog)\.tsx?$/u;
const submits = files.filter(
  ({ path, text }) => SUBMIT_FILE.test(path) && /\.mutate\(/u.test(text),
);

describe('mutation conventions', () => {
  it('finds the submit handlers it checks', () => {
    expect(submits.length).toBeGreaterThanOrEqual(9);
  });

  it.each(submits)(
    '$path guards its submit with useSingleFlight',
    ({ text }) => {
      expect(text).toContain('useSingleFlight()');
      expect(text).toContain('flight.start()');
      expect(text).toContain('onSettled: flight.end');
    },
  );

  it.each(
    files.filter(
      ({ path, text }) =>
        path !== 'lib/forget-queries.ts' && /\.removeQueries\(/u.test(text),
    ),
  )('$path only removes queries nobody watches', ({ text }) => {
    for (const match of text.matchAll(/\.removeQueries\(/gu)) {
      expect(text.slice(match.index, match.index + 120)).toContain(
        "type: 'inactive'",
      );
    }
  });
});
