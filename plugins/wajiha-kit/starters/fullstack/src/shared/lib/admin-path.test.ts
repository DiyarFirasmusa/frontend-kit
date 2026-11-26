import { describe, expect, it } from 'vitest';
import { adminHome, isAdminPath } from './admin-path';

describe('isAdminPath', () => {
  it('matches the admin and its pages in every language', () => {
    expect(isAdminPath('/ar/admin')).toBe(true);
    expect(isAdminPath('/en/admin/suppliers')).toBe(true);
    expect(isAdminPath('/EN/Admin/login')).toBe(true);
  });

  it('leaves the public pages alone', () => {
    expect(isAdminPath('/ar')).toBe(false);
    expect(isAdminPath('/en/about')).toBe(false);
    expect(isAdminPath('/en/news/admin')).toBe(false);
    expect(isAdminPath('/admin')).toBe(false);
    expect(isAdminPath('/fr/admin')).toBe(false);
  });

  it('builds the admin home for a language', () => {
    expect(adminHome('ar')).toBe('/ar/admin');
  });
});
