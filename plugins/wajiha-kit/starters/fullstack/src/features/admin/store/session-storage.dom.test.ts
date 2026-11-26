import { describe, expect, it, vi } from 'vitest';
import { useAuthStore } from './auth-store';
import { usePermissionStore } from './permission-store';
import { SESSION_KEYS, SESSION_STORE_VERSION } from './session-storage';

const OLD_TOKEN = 'mock-token-admin-old-session';

const AUTH = { user: { id: 'u1', username: 'sara', name: 'Sara' }, accessToken: OLD_TOKEN };
const RIGHTS = { roles: ['admin'], permissions: [] };

function save(key: string, state: unknown, version?: number): void {
  window.sessionStorage.setItem(
    key,
    JSON.stringify(version === undefined ? { state } : { state, version }),
  );
}

/** What a page load does: both stores read what sessionStorage holds. */
async function reload(): Promise<void> {
  await usePermissionStore.persist.rehydrate();
  await useAuthStore.persist.rehydrate();
}

function storedText(): string {
  return SESSION_KEYS.map((key) => window.sessionStorage.getItem(key) ?? '').join('|');
}

describe('the stored session across versions', () => {
  it('keeps a session saved by the current version', async () => {
    save('admin-auth', AUTH, SESSION_STORE_VERSION);
    save('admin-permissions', RIGHTS, SESSION_STORE_VERSION);
    await reload();
    expect(useAuthStore.getState()).toMatchObject({ accessToken: OLD_TOKEN });
    expect(usePermissionStore.getState().roles).toEqual(['admin']);
  });

  it('erases a session saved without a version (older starters), the token with it, with no console error', async () => {
    const error = vi.spyOn(console, 'error');
    save('admin-auth', AUTH);
    save('admin-permissions', RIGHTS);
    await reload();
    expect(useAuthStore.getState()).toMatchObject({ user: null, accessToken: null });
    expect(usePermissionStore.getState()).toMatchObject({ roles: [], permissions: [] });
    expect(storedText()).not.toContain(OLD_TOKEN);
    expect(error).not.toHaveBeenCalled();
  });

  it('erases a session saved by another version, with no console error', async () => {
    const error = vi.spyOn(console, 'error');
    save('admin-auth', AUTH, 0);
    save('admin-permissions', RIGHTS, 0);
    await reload();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(storedText()).not.toContain(OLD_TOKEN);
    expect(error).not.toHaveBeenCalled();
  });

  it('erases both halves when only one is current (never "signed in" without rights)', async () => {
    save('admin-auth', AUTH, SESSION_STORE_VERSION);
    save('admin-permissions', RIGHTS, 0);
    await reload();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(storedText()).not.toContain(OLD_TOKEN);
  });

  it('erases a token that has no rights beside it', async () => {
    save('admin-auth', AUTH, SESSION_STORE_VERSION);
    await reload();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(storedText()).not.toContain(OLD_TOKEN);
  });

  it('starts empty from text that is not JSON', async () => {
    const error = vi.spyOn(console, 'error');
    window.sessionStorage.setItem('admin-auth', '{not json');
    window.sessionStorage.setItem('admin-permissions', 'null');
    await reload();
    expect(useAuthStore.getState().accessToken).toBeNull();
    expect(storedText()).not.toContain('not json');
    expect(error).not.toHaveBeenCalled();
  });

  it('leaves an empty storage alone', async () => {
    await reload();
    expect(useAuthStore.getState().accessToken).toBeNull();
  });
});
