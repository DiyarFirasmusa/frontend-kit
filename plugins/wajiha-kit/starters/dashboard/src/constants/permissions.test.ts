import { describe, expect, it } from 'vitest';
import { PERMS } from './permissions';

function snake(value: string): string {
  return value.replaceAll(/[A-Z]/gu, (letter) => `_${letter.toLowerCase()}`);
}

function flatten(): string[] {
  return Object.values(PERMS).flatMap((group) => Object.values(group));
}

describe('PERMS', () => {
  it('uses the <resource>:<action> shape for every permission', () => {
    for (const permission of flatten()) {
      expect(permission).toMatch(/^[a-z][a-z_]*:[a-z_]+$/u);
    }
  });

  it('has no duplicate permission strings across resources', () => {
    const values = flatten();
    expect(new Set(values).size).toBe(values.length);
  });

  it('names each group after the resource in its strings', () => {
    for (const [group, actions] of Object.entries(PERMS)) {
      for (const permission of Object.values(actions)) {
        expect(permission.startsWith(`${snake(group)}:`)).toBe(true);
      }
    }
  });

  it('pins the list, so a rename on either side is noticed', () => {
    expect(flatten()).toMatchInlineSnapshot(`
      [
        "warehouse:read",
        "warehouse:create",
        "warehouse:update",
        "warehouse:delete",
        "supplier:read",
        "supplier:create",
        "supplier:update",
        "supplier:delete",
        "unit_of_measure:read",
        "unit_of_measure:create",
        "unit_of_measure:update",
        "unit_of_measure:delete",
        "item_category:read",
        "item_category:create",
        "item_category:update",
        "item_category:delete",
        "attribute_definition:read",
        "attribute_definition:create",
        "attribute_definition:update",
        "attribute_definition:delete",
        "audit_log:read",
      ]
    `);
  });
});
