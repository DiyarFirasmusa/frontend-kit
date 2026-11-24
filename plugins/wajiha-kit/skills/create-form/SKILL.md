---
name: create-form
description: Create a form in any frontend stack with the project's own form and validation tools (react-hook-form + zod 4 where installed) — schema, accessible labelled fields, inline errors, single-flight submit. Use for any input UI — login, phone, OTP, registration, address, profile, settings, filters, create/edit dialogs.
---

# Create form

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
2. Open the nearest form, its validation and the code that sends it. Take their libraries, folders and names.
3. Reuse the project's field components and validators (phone, email).

With no form to follow: the installed form and validation libraries, else the framework's built-in form handling and one
pure validate function. Add no library without asking.

| Installed | Reference |
| --------- | --------- |
| `react-hook-form` + `zod` installed | `references/react-hook-form.md`, also beside an existing form |

## 2. Split it

- **Validation:** one schema or pure function, shared by the fields and the submit, testable alone.
- **State and submit:** outside the markup, through the project's data layer. Never a request from the view.
- **View:** fields and errors.

## 3. Rules in every stack

- A visible label per field. Errors inline, linked to the field, announced, and the first invalid one gets focus.
- The right `type`, `inputmode` and `autocomplete`. Phone, OTP, card and email values left to right.
- Single-flight: a submit while one is pending does nothing. The user's input survives a failed submit.
- Server field errors land on their fields. Don't repeat an error the data layer already announces.
- Text and messages go through the project's i18n when it has one, in every language it ships.
- No secret in storage, the URL or a log. A client check never replaces the server's.

## 4. Prove it

- Test the validation (valid and each invalid) and what submit sends, with the project's runner. With no runner, use one
  built into the runtime when the validation file runs there as it is, else say so and don't install one.
- Run every test you wrote. One that shares module state resets it between cases. A test you couldn't run is
  reported as not run, never as passing.
- Run the project's own typecheck and lint. Report the form you followed and what you didn't check.
