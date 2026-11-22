---
name: create-component
description: Create or extract a UI component in any frontend stack (React, Vue, Svelte, Angular, plain) — any new component, card, button, dialog, badge, section or other UI piece, even a small one. Use whenever the user asks to build, create, write, add or extract a component. Follows the project's own pattern (location by ownership, file style, tokens) with accessible markup and translated text. With a Figma link, run figma-match alongside.
---

# Create component

The principles are fixed. The library, folder, file name, language and syntax are the project's: what the user said,
then the project's own pattern, then the framework's convention, then this kit's example.

The stack is what `package.json` and the code use. The profile name `react` doesn't mean React: never write JSX or a
hook in a project without React. The references are in `${CLAUDE_SKILL_DIR}/references/`.

## 1. Learn how this project does it, before writing

1. Read "Where things are" in `.claude/rules/project.md` and the layout in `CLAUDE.md`, if they exist.
2. **Does it exist?** Look in the shared components and in the feature. The UI kit's primitives come before your own.
3. Open the nearest component of the same kind. Take its folder, file name, export, props, styling and text handling.
4. **Where?** Used once: inline, or beside the page that uses it. Used by one feature: with that feature. By two: where
   the project keeps shared components.

With no component to follow, read the one reference for the stack. With none, use the framework's own convention.

| Stack | Reference |
| ----- | --------- |
| React with TanStack Router (website and dashboard profiles) | `references/react-tanstack.md`, also beside an existing component |
| Any other | `references/other-stacks.md` |

## 2. Rules in every stack

- It shows values and reports events. No request, storage, mutation or business calculation inside it.
- One job per component, with the language (TypeScript or JavaScript) of its neighbours.
- The project's tokens and components: no one-off colour, no second styling system, no new dependency without asking.
- Semantic elements: a link navigates, a button acts. A name for every control, `alt` and size for images, the heading
  level that fits where it sits, visible focus, targets of 44px.
- Text goes through the project's i18n when it has one, in every language it ships.
- Logical properties (start/end). The narrowest screen first, then up. States of the data it is given.
- Rendered on a server: no browser API during render.

## 3. Prove it

- Non-trivial behaviour gets a test with the project's runner. With no runner, say so and don't install one.
- Run every test you wrote. One that shares module state resets it between cases. A test you couldn't run is
  reported as not run, never as passing.
- Run the project's own typecheck and lint, then look at it in each language, width and theme the project has.
- Report the file you followed and what you didn't check.
