import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs';
import { tmpdir } from 'node:os';
import { join } from 'node:path';
import { afterEach, beforeEach, describe, expect, it } from 'vitest';
import { findMaps, isMapFile, moveMaps } from './proof-maps.ts';

let root = '';

function put(path: string, text = 'x'): void {
  const file = join(root, path);
  mkdirSync(join(file, '..'), { recursive: true });
  writeFileSync(file, text);
}

beforeEach(() => {
  root = mkdtempSync(join(tmpdir(), 'proof-maps-'));
});
afterEach(() => {
  rmSync(root, { recursive: true, force: true });
});

describe('isMapFile', () => {
  it('knows a source map and its compressed copies, and nothing else', () => {
    for (const name of ['a.js.map', 'a.js.map.br', 'a.js.map.gz', 'a.js.map.zst', 'x/y.css.map']) {
      expect(isMapFile(name)).toBe(true);
    }
    for (const name of ['a.js', 'a.js.br', 'map.js', 'sitemap.xml', 'roadmap.json', 'a.mapx']) {
      expect(isMapFile(name)).toBe(false);
    }
  });
});

describe('findMaps', () => {
  it('lists every map below the folder, nested ones too, and ignores other files', () => {
    put('out/public/assets/a.js');
    put('out/public/assets/a.js.map');
    put('out/public/assets/a.js.map.br');
    put('out/server/chunks/b.mjs.map');
    expect(findMaps(join(root, 'out'))).toEqual([
      'public/assets/a.js.map',
      'public/assets/a.js.map.br',
      'server/chunks/b.mjs.map',
    ]);
  });

  it('answers an empty list for a folder that does not exist', () => {
    expect(findMaps(join(root, 'nothing'))).toEqual([]);
  });

  it('finds nothing in a clean output', () => {
    put('out/public/assets/a.js');
    put('out/public/sitemap.xml');
    expect(findMaps(join(root, 'out'))).toEqual([]);
  });
});

describe('moveMaps', () => {
  it('moves the maps out, keeps their relative paths and content, and leaves the rest', () => {
    put('out/public/assets/a.js', 'code');
    put('out/public/assets/a.js.map', '{"version":3}');
    put('out/public/assets/a.js.map.gz', 'zip');
    const moved = moveMaps(join(root, 'out'), join(root, 'proof'));
    expect(moved).toEqual(['public/assets/a.js.map', 'public/assets/a.js.map.gz']);
    expect(findMaps(join(root, 'out'))).toEqual([]);
    expect(readFileSync(join(root, 'proof/public/assets/a.js.map'), 'utf8')).toBe('{"version":3}');
    expect(readFileSync(join(root, 'out/public/assets/a.js'), 'utf8')).toBe('code');
  });
});
