import { describe, expect, it } from 'vitest';
import { categorySearchSchema, defaultCategorySearch } from './search';

describe('categorySearchSchema', () => {
  it('fills every default for an empty URL', () => {
    expect(defaultCategorySearch).toEqual({ q: '', category: '' });
  });

  it('keeps an all-digit search text and id as strings', () => {
    expect(categorySearchSchema.parse({ q: 100553, category: 42 })).toEqual({
      q: '100553',
      category: '42',
    });
  });

  it('falls back on bad values instead of throwing', () => {
    expect(
      categorySearchSchema.parse({ q: { nested: true }, category: ['a'] }),
    ).toEqual(defaultCategorySearch);
  });

  it('parses a shared link, including the all-items row', () => {
    expect(
      categorySearchSchema.parse({ q: ' hand ', category: 'cat-hand' }),
    ).toEqual({ q: 'hand', category: 'cat-hand' });
    expect(categorySearchSchema.parse({ category: 'all' }).category).toBe(
      'all',
    );
  });
});
