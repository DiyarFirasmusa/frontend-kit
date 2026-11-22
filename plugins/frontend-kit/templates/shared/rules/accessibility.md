---
paths:
  - "**/src/**/*.{jsx,tsx}"
  - "app/**/*.{jsx,tsx}"
---

# Accessibility beyond the basics

Labels, semantic elements, contrast and "`aria-*` only where HTML has no answer" are in `quality-bar.md` and `forms.md`.
This file covers WCAG 2.2 AA criteria that coding agents miss. The bar is AA; AAA is not required.

## Focus

- **Route change.** The new page's heading gets focus, or the router's announcer does it. Next.js has a route announcer.
  TanStack Router and React Router do not, so the layout moves focus to the page `h1` (`tabIndex={-1}`) after the route
  renders.
- **Not obscured (2.4.11).** A sticky header, a bulk-action bar or a toast must not cover the focused element. Scrolling
  containers get `scroll-padding-top` (or `scroll-margin-top` on the target) equal to the sticky height.
- **Dialogs.** The primitive traps focus, the dialog has an accessible name, Escape closes it, and focus returns to the
  opener. A non-modal popover does not trap focus.
- **Scrollable regions.** A keyboard-scrollable wrapper with no focusable child gets `tabIndex={0}` and a name.

## Input and interaction

- **Dragging (2.5.7).** Every drag to reorder or move has a button alternative (move up, move down). A keyboard shortcut
  alone does not count.
- **Target size (2.5.8).** 24×24 CSS px minimum. This kit's own standard is 44×44 (`quality-bar.md`).
- **Redundant entry (3.3.7).** Do not ask again for data given earlier in the same process (shipping address as billing
  address), unless the second entry is essential.
- **Accessible authentication (3.3.8).** Never block paste or password-manager fill in a login, OTP or recovery field. An
  OTP field accepts the full code pasted at once. No puzzle or memory test.
- **Timing (2.2.1).** A session timeout warns first and lets the user extend it.
- **Disabled vs. `aria-disabled`.** A control the user cannot use right now stays focusable with `aria-disabled="true"` and
  says why in text (`permissions.md`). Native `disabled` only where the control is not part of the task.

## Messages

- **Status messages (4.1.3).** A result shown without moving focus (saved, deleted, N rows updated) is announced: a
  `role="status"` region for polite messages, `role="alert"` only for an error that needs action now. The toast system is
  one live region; never put a message only in a toast that vanishes in seconds.
- **Field errors.** `aria-invalid="true"` on the field and `aria-describedby` pointing at its message. On a failed submit,
  focus the first invalid field, and list the errors in a summary that links to them.

## Names and language

- **Label in name (2.5.3).** The accessible name contains the visible label text. A visible "Save" button may be named
  "Save order", not "Submit".
- **Language of parts (3.1.2).** An English phrase inside Arabic text (a product or brand name) gets `lang="en"`.

## Layout

- **Reflow (1.4.10).** Content works at 320 CSS px wide with no page-level horizontal scroll; tables, maps and code scroll in
  their own container. The e2e check uses 375 px; add 320 px for a new page.
- **Text spacing (1.4.12).** No text is clipped or overlapped when the user raises line height, letter spacing or word
  spacing. No fixed heights on text containers.
- **Non-text contrast (1.4.11).** Input borders and focus rings reach 3:1 against their background, in light and dark.
- **Forced colours.** Focus rings are outlines or borders, not `box-shadow` alone: Windows High Contrast removes shadows.

## Testing

- axe checks the rendered DOM only. It does not check focus order, focus return, announcements, drag alternatives, redundant
  entry or authentication. Those need a Playwright check or a manual pass (`testing.md`).
- Closed dialogs and menus are not checked until opened: the e2e spec opens them before the axe run.

Not required: AAA criteria 2.4.12, 2.4.13, 3.3.9 and 2.3.3.
