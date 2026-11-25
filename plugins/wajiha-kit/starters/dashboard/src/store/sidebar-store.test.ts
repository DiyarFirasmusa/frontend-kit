import { afterEach, describe, expect, it } from 'vitest';
import { useSidebarStore } from './sidebar-store';

afterEach(() => {
  useSidebarStore.setState({ collapsed: false });
});

describe('useSidebarStore', () => {
  it('starts expanded', () => {
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it('toggles the collapsed flag', () => {
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().collapsed).toBe(true);
    useSidebarStore.getState().toggle();
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it('sets the collapsed flag explicitly', () => {
    useSidebarStore.getState().setCollapsed(true);
    expect(useSidebarStore.getState().collapsed).toBe(true);
    useSidebarStore.getState().setCollapsed(false);
    expect(useSidebarStore.getState().collapsed).toBe(false);
  });

  it('persists only the collapsed flag under the sidebar-collapsed key', () => {
    useSidebarStore.getState().setCollapsed(true);
    const raw = window.localStorage.getItem('sidebar-collapsed');
    expect(raw).not.toBeNull();
    const parsed = JSON.parse(raw ?? '{}') as {
      state: Record<string, unknown>;
    };
    expect(parsed.state).toEqual({ collapsed: true });
  });
});
