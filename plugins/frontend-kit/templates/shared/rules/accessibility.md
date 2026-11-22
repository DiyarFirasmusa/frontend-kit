---
paths:
  - "**/src/**/*.{jsx,tsx}"
  - "app/**/*.{jsx,tsx}"
  - "{components,pages}/**/*.{jsx,tsx}"
---

# Accessibility beyond the basics

Labels, semantic elements, contrast and "`aria-*` only where HTML has no answer" are in `quality-bar.md`.
This file covers WCAG 2.2 AA criteria that coding agents miss. The bar is AA; AAA is not required.

## Focus

- **Route change.** Use the router's announcer where it has one (Next.js does). Otherwise (TanStack Router and React Router,
  for example) the layout moves focus to the page `h1` (`tabIndex={-1}`) when the **pathname** changes: not on first load,
  and not when only search params or the hash change (focus would leave a search box while the user types).
- **Not obscured (2.4.11).** A sticky header, a bulk-action bar or a toast must not cover the focused element. Scrolling
  containers get `scroll-padding-top` (or `scroll-margin-top` on the target) equal to the sticky height.
- **Dialogs, tabs, menus, comboboxes.** Use the project's primitives. A modal traps focus, makes the rest inert, has a
  name, closes on Escape and returns focus to the opener. A non-modal popover does not trap focus. Site navigation is
  links with a disclosure button, not `role="menu"`.
- **Scrollable regions.** A keyboard-scrollable wrapper with no focusable child gets `tabIndex={0}`, `role="region"` and
  a name.

## Input and interaction

- **Dragging (2.5.7).** Every drag to reorder or move has a button alternative (move up, move down). A keyboard shortcut
  alone does not count.
- **Target size (2.5.8).** 24×24 CSS px minimum; the kit's own is 44 (`quality-bar.md`).
- **Redundant entry (3.3.7).** Do not ask again for data given earlier in the same process (shipping address as billing
  address), unless the second entry is essential.
- **Accessible authentication (3.3.8).** Never block paste or password-manager fill in a login, OTP or recovery field. An
  OTP field accepts the full code pasted at once. No puzzle or memory test. Credential fields carry `autocomplete`
  (`username`, `current-password`, `new-password`, `one-time-code`); a `shipping` or `billing` prefix goes first.
- **Timing (2.2.1).** A session timeout warns first and gives at least 20 seconds to extend.
- **Disabled vs. `aria-disabled`.** A control that is unavailable for a reason the user must learn stays focusable with
  `aria-disabled="true"` and says why in text. `aria-disabled` blocks nothing: the handler returns at once, and a test
  clicks it and asserts that nothing happened. A pending submit and a read-only fieldset stay native `disabled`; values
  the user may copy are text or `readOnly`.

## Messages

- **Status messages (4.1.3).** A result shown without moving focus (saved, deleted, N rows updated) is announced: a
  `role="status"` region for polite messages, `role="alert"` only for an error that needs action now. The toast system is
  one live region. An error the user must act on is never only a timed toast.
- **Field errors.** `aria-invalid="true"` on the field and `aria-describedby` pointing at its message. On a failed submit,
  focus the first invalid field, and list the errors in a summary that links to them.

## Names and language

- **Label in name (2.5.3).** The accessible name contains the visible label text. A visible "Save" button may be named
  "Save order", not "Submit".
- **Language of parts (3.1.2).** A phrase or sentence in another language gets `lang` (English inside Arabic: `lang="en"`).
  Proper and brand names do not need it.

## Layout

- **Reflow (1.4.10).** Content works at 320 CSS px wide with no page-level horizontal scroll; tables, maps and code scroll in
  their own container. The e2e check uses 375 px; add 320 px for a new page.
- **Text spacing (1.4.12).** No text is clipped or overlapped when the user raises line height, letter spacing or word
  spacing. No fixed heights on text containers.
- **Non-text contrast (1.4.11).** Input borders and focus rings reach 3:1 against their background, in light and dark.
- **Forced colours.** Focus rings are outlines or borders, not `box-shadow` alone: Windows High Contrast removes shadows.

What axe cannot check is in `testing.md`.
