import type { i18n as I18n } from 'i18next';
import { describe, expect, it } from 'vitest';
import { adminHead } from './admin-head';

const fakeI18n = { t: (key: string) => `[${key}]` } as unknown as I18n;

describe('adminHead', () => {
  it('titles a page "<page> | <admin name>" in the page language', () => {
    const head = adminHead('suppliers.title')({ match: { context: { i18n: fakeI18n } } });
    expect(head).toEqual({ meta: [{ title: '[suppliers.title] | [admin.title]' }] });
  });

  it('gives different pages different titles', () => {
    const context = { match: { context: { i18n: fakeI18n } } };
    expect(adminHead('overview.title')(context)).not.toEqual(adminHead('settings.title')(context));
  });
});
