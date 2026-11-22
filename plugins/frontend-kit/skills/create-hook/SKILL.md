---
name: create-hook
description: Create a hook or its equivalent in any frontend stack (React hook, Vue composable, Svelte rune module, Angular service) — data fetching (TanStack Query where installed), page orchestration or a small utility — where the project keeps it, with guards and tests. Use whenever the user asks to create, write, add or extract a hook or composable, or when a page or component is accumulating logic.
---

# Create hook

The principles are fixed. The library, folder, file name, language and syntax are the project's: what the user said,
then the project's own pattern, then the framework's convention, then this kit's example.

The stack is what `package.json` and the code use. The profile name `react` doesn't mean React. Write JSX only where
the project's framework uses it (React, Preact, Solid); Vue, Svelte and Angular have their own forms (composable, rune
module, service). The references are in `${CLAUDE_SKILL_DIR}/references/`.

When the project uses a library that has a reference below, read that reference, also when there is code to follow:
it holds that library's must-nots. Code to follow decides folders and names, the reference decides how the library is
used safely. The profile's `CLAUDE.md` stack (website, dashboard, fullstack) is the project's choice: when it names a
library that isn't installed yet, offer to install it before writing around it.

## 1. Learn how this project does it, before writing

1. Read "Where things are" in `.claude/rules/project.md` and the layout in `CLAUDE.md`, if they exist.
2. Open the nearest one of the same kind. Take its folder, file name, export, dependencies and language.
3. It lives with the feature that owns it, and moves to the shared place when a second feature needs it. Where the
   project keeps data hooks apart from utility hooks, keep that split.

With none to follow, read the one reference for the stack. With none, use the framework's own convention.

| Stack | Reference |
| ----- | --------- |
| `@tanstack/react-query` installed | `references/react-tanstack.md`, also beside an existing hook |
| Any other | `references/other-stacks.md` |

## 2. Split it

- **Pure logic is not a hook:** plain functions, tested alone.
- **Data access** goes through the project's client or service. One owner per piece of server data, never copied.
- **The hook** connects them to the framework: it returns values and named actions.
- **The view** has no orchestration left.

## 3. Rules in every stack

- Every effect, listener, timer and subscription is cleaned up. A request that is no longer wanted is cancelled.
- Guards before work: missing id, no session, already pending. Loading, error and empty are visible to the caller.
- Values from the URL, storage and the network are validated where they enter.
- Rendered on a server: browser APIs only on the client.
- No new dependency without asking.

## 4. Prove it

- Test the pure part and the wiring with the project's runner. With no runner, use one built into the runtime when the
  logic file runs there as it is, else say so and don't install one.
- Run every test you wrote. One that shares module state resets it between cases. A test you couldn't run is
  reported as not run, never as passing.
- Run the project's own typecheck and lint. Report the file you followed and what you didn't check.
