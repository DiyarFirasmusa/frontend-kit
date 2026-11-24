# Zustand, only when it is installed

The paths and names below are the kit's example. An existing store's folder, file name and shape win. `<shared>` is the
project's shared folder and `<projectName>` its name (`.claude/wajiha-kit.json`, else `CLAUDE.md`).

- Server data → TanStack Query. Never copy it into Zustand.
- Page-local UI state → `useState` in the page hook.
- Form state → react-hook-form.
- URL-shareable state (tab, filter, page, sort) → search params
  (`validateSearch` + `Route.useSearch()`).

Two kinds remain.

## Global store — `<shared>/store/<name>-store.ts`

Client state shared by features (session flags, UI preferences, a client-side
cart or selection). Persist only what must survive a reload, with a
`<projectName>-` key prefix, and never tokens.

```ts
import { create } from 'zustand'
import { persist } from 'zustand/middleware'
import { isLanguageId, type LanguageId } from '@/<shared>/lib/i18n/languages'

interface SettingsState {
  language: LanguageId
  setLanguage: (language: LanguageId) => void
}

export const useSettingsStore = create<SettingsState>()(
  persist(
    (set) => ({
      language: 'ar',
      setLanguage: (language) => {
        set({ language })
      },
    }),
    {
      name: '<projectName>-settings',
      version: 1,
      // What storage holds may be old or edited by hand: keep only values that are still valid.
      merge: (stored, current) => {
        const language = (stored as Partial<SettingsState> | undefined)?.language
        return isLanguageId(language) ? { ...current, language } : current
      },
    },
  ),
)
```

User data must be reset by the project's sign-out function (`CLAUDE.md`
names it) — add the new store's reset there, and to the test helper that
resets stores between tests.

Website (TanStack Start): a persisted store hydrates on the client only —
render the server-safe default first and don't read `localStorage` during
render, or the HTML and the first client render disagree. The Zustand way:
`persist(..., { skipHydration: true })`, then call `useXStore.persist.rehydrate()`
in `beforeLoad` of client-only routes and in a layout effect for the rest.

A store holds guest data only (ids, a cart of ids) when sign-out should not clear
it: say which stores sign-out resets in `project.md`; a guest cart is not user data.

## Hand-off store — `<feature>/store/<x>-store.ts`

Passes an object between routes (a selected item, a receipt). No persist
unless it must survive a full-page redirect (then `sessionStorage`).

```ts
interface SelectedItemState {
  item: SelectedItem | null
  setItem: (item: SelectedItem) => void
  clear: () => void
}

export const useSelectedItemStore = create<SelectedItemState>((set) => ({
  item: null,
  setItem: (item) => {
    set({ item })
  },
  clear: () => {
    set({ item: null })
  },
}))
```

The receiving page redirects away when the store is empty and calls `clear()`
when the flow ends.

## Rules

- `<name>-store.ts`, export `use<Name>Store`.
- Subscribe with selectors (`useSettingsStore((state) => state.language)`);
  outside React use `useXStore.getState()`.
- Braced setter bodies (oxlint `curly`).
- A persisted store has a `version`. When the stored shape changes, raise it and add `migrate`.
- Unit-test the store's actions; reset between tests.
