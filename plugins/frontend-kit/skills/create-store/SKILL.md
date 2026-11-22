---
name: create-store
description: Create shared client state in any frontend stack (a store, slice, service, rune, signal or plain module) for a value that outlives a component, such as a preference, session, cart or draft, persisted when needed. Use whenever the user asks to add global, shared or persisted client state, or a store.
---

# Create shared state

The principles are fixed. The library, folder, file name, language and syntax are the project's: what the user said,
then the project's own pattern, then the framework's convention, then this kit's example.

The stack is what `package.json` and the code use. The profile name `react` doesn't mean React: never write JSX or a
hook in a project without React. The references are in `${CLAUDE_SKILL_DIR}/references/`.

## 1. Does it need shared state?

- Server data belongs to the project's data layer. Never copy it into a store.
- State of one screen stays with that screen. Form state stays with the form.
- State a link should share (tab, filter, page) belongs in the URL.

What is left is client state that several screens use, or that must survive a screen change or a reload.

## 2. Learn how this project does it, before writing

1. Read "Where things are" in `.claude/rules/project.md` and the layout in `CLAUDE.md`, if they exist.
2. Open the nearest existing shared state, where it is registered, and one view that uses it.
3. Find what already does persistence, validation and reset on sign-out.

From those, take the library, language, folder, file name, export shape and registration. If they differ from each
other, take the one nearest to the feature and say so.

When the project has no shared state yet, it lives with the feature that owns it, in the folders and file style the
features already have. Use what is built in or already installed, with the one reference below. With no reference,
use the framework's own convention. Ask before adding a dependency.

| Framework | Reference |
| --------- | --------- |
| React with Zustand installed (website and dashboard profiles) | `references/zustand.md`, also beside an existing store |
| React without it | `references/react.md` |
| Vue | `references/vue.md` |
| Svelte | `references/svelte.md` |
| Angular | `references/angular.md` |

## 3. Split it

- **Logic:** pure transitions and derived values, as a separate testable unit when there is more than assignment.
- **State:** holds the values and exposes named actions. Nothing changes them from outside.
- **Storage:** through the project's helper. Validate what is read. Never store a token.
- **View:** reads the smallest value it needs and calls actions. It knows nothing of storage or the rules.

Persist only what must survive a reload. With server rendering, never read browser storage while rendering on the
server. Reset user data where the project signs out.

## 4. Prove it

- Write a test of the transitions, in the project's test runner. With none, use one that is built into the runtime
  when the logic file runs there as it is (plain JavaScript on Node: `node --test`). Only when neither exists, write
  no test, say so and ask. Never install one unasked.
- Run every test you wrote. One that shares module state resets it between cases. A test you couldn't run is
  reported as not run, never as passing.
- Run the project's own typecheck, lint and tests (`commands` in `.claude/frontend-kit.json`, or its package scripts).
- Report the existing file you followed, the files you changed, and anything not checked.
