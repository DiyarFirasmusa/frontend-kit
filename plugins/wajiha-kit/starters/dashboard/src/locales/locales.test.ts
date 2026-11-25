import { describe, expect, it } from 'vitest';
import {
  NAV_GROUPS,
  NAV_HOME,
} from '@/layout/dashboard/sidebar/config/nav-config';
import ar from './ar.json';
import en from './en.json';

type Tree = { [key: string]: Tree | string };

function flattenKeys(tree: Tree, prefix = ''): string[] {
  return Object.entries(tree).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : flattenKeys(value, path);
  });
}

function hasKey(tree: Tree, dotted: string): boolean {
  let cur: Tree | string | undefined = tree;
  for (const part of dotted.split('.')) {
    if (typeof cur !== 'object') {
      return false;
    }
    cur = cur[part];
  }
  return typeof cur === 'string';
}

const ENUM_KEYS: Record<string, string[]> = {
  AttributeDataType: ['TEXT', 'NUMBER', 'BOOLEAN', 'DATE', 'OPTION'],
};

// Read from the real nav config, so a new nav item without a label fails here.
const NAV_CONFIG_KEYS = [
  NAV_HOME.labelKey,
  ...NAV_GROUPS.flatMap((group) => [
    group.labelKey,
    ...group.items.map((item) => item.labelKey),
  ]),
];

describe('global locale bundles', () => {
  it('en and ar have identical key trees', () => {
    const enKeys = flattenKeys(en as Tree).toSorted();
    const arKeys = flattenKeys(ar as Tree).toSorted();
    expect(arKeys).toEqual(enKeys);
  });

  it.each(Object.entries(ENUM_KEYS))(
    '%s enum labels exist in en and ar',
    (name, values) => {
      for (const value of values) {
        const key = `enums.${name}.${value}`;
        expect(hasKey(en as Tree, key), `en ${key}`).toBe(true);
        expect(hasKey(ar as Tree, key), `ar ${key}`).toBe(true);
      }
    },
  );

  it('every nav key used by the sidebar config exists in en and ar', () => {
    for (const key of NAV_CONFIG_KEYS) {
      expect(hasKey(en as Tree, key), `en ${key}`).toBe(true);
      expect(hasKey(ar as Tree, key), `ar ${key}`).toBe(true);
    }
  });

  it('keeps the shell, actions and common keys used by the shell', () => {
    for (const key of [
      'shell.brand.title',
      'shell.workspace.label',
      'common.unknown',
      'common.logout',
      'common.language',
      'common.light',
      'common.dark',
      'common.active',
      'common.inactive',
    ]) {
      expect(hasKey(en as Tree, key), `en ${key}`).toBe(true);
      expect(hasKey(ar as Tree, key), `ar ${key}`).toBe(true);
    }
  });
});
