import { describe, expect, it } from 'vitest';
import ar from './ar.json';
import en from './en.json';

type Json = { [key: string]: Json | string };

function collectKeys(node: Json, prefix = ''): string[] {
  return Object.entries(node).flatMap(([key, value]) => {
    const path = prefix ? `${prefix}.${key}` : key;
    return typeof value === 'string' ? [path] : collectKeys(value, path);
  });
}

function collectValues(node: Json): string[] {
  return Object.values(node).flatMap((value) =>
    typeof value === 'string' ? [value] : collectValues(value),
  );
}

describe('categories locales', () => {
  const enKeys = collectKeys(en).toSorted();
  const arKeys = collectKeys(ar).toSorted();

  it('en and ar have identical nested key sets', () => {
    expect(arKeys).toEqual(enKeys);
  });

  it('every value is a non-empty string in both languages', () => {
    for (const value of [...collectValues(en), ...collectValues(ar)]) {
      expect(value.trim().length).toBeGreaterThan(0);
    }
  });

  it('exposes a single top-level categories namespace', () => {
    expect(Object.keys(en)).toEqual(['categories']);
    expect(Object.keys(ar)).toEqual(['categories']);
  });

  it('contains the contracted keys', () => {
    const contracted = [
      'categories.title',
      'categories.actions.addCategory',
      'categories.tree.empty',
      'categories.form.noParent',
      'categories.delete.description',
      'categories.blocked.title',
      'categories.assignments.col.variantAxis',
      'categories.attributes.filters.status',
      'categories.attributeForm.usageNote',
      'categories.options.title',
      'categories.options.moveDown',
      'categories.validation.sortOrderInvalid',
      'categories.toasts.optionDeleted',
    ];
    for (const key of contracted) {
      expect(enKeys).toContain(key);
      expect(arKeys).toContain(key);
    }
  });

  it('keeps interpolation placeholders in both languages', () => {
    expect(en.categories.delete.description).toContain('{{name}}');
    expect(ar.categories.delete.description).toContain('{{name}}');
    expect(en.categories.options.title).toContain('{{name}}');
    expect(ar.categories.options.title).toContain('{{name}}');
  });
});
