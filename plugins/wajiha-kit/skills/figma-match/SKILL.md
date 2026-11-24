---
name: figma-match
description: Build or fix UI so it matches a Figma frame exactly — spacing, sizes, colours, radii, type, states — using the project's tokens, in Arabic RTL and English LTR, phone and desktop, with no layout shift. Use when the user gives a figma.com link or says "like Figma", "follow Figma", "same as the design".
argument-hint: "<figma url>"
---

# Match Figma

Values written `<name>` below (`<defaultBranch>`, `<devPort>`, `<githubRepo>`, `<liveHost>`, `<uatHost>`, …) are this project's: read them from `.claude/wajiha-kit.json` (`liveHosts[0]` for `<liveHost>`), else from `CLAUDE.md`.

The frame is the spec. Don't "improve" it; when it is ambiguous or missing a
state, ask or follow the closest sibling screen.

## 1. Read the design

Load the `figma:figma-design-to-code` skill, then: `create_session` with the
file key, `get_design_context` (node id from `node-id=1-2` → `1:2`) and
`get_screenshot` of the same node. Note every value: spacing, gaps, padding,
sizes, radius, font size/weight/line height, colours, icon, states
(hover, pressed, disabled, loading, empty, error).

## 2. Map to the project, not to raw values

- Colours, type, radii and spacing → the project's theme tokens
  (`.claude/rules/styles.md` says where they live). A value with no token:
  closest token if within 1px, else ask.
- Reuse the shared components and existing classes; `create-component` for
  new pieces. Logical properties only (`.claude/rules/rtl.md`); mirror
  directional icons.
- Text through `t()` in Arabic and English.

## 3. Compare

Run the page on `http://localhost:<devPort>` (`dev` skill) and screenshot
it next to the Figma screenshot at the frame's width, then at phone width
(375) and desktop (1440), Arabic and English, light and dark. List any
difference and fix it until none is left. Load with throttled network once:
nothing may jump.

## 4. Report

What matches, any deliberate difference with its reason, and the widths and
languages checked.
