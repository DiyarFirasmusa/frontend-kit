import { create } from 'zustand';

type MenuState = {
  open: boolean;
  setOpen: (open: boolean) => void;
  toggle: () => void;
};

/** Phone navigation menu. Client-only UI state: nothing here ever needs the server. */
export const useMenuStore = create<MenuState>((set) => ({
  open: false,
  setOpen: (open) => set({ open }),
  toggle: () => set((state) => ({ open: !state.open })),
}));
