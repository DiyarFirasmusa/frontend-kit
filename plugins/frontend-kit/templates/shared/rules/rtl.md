---
paths:
  - "src/**/*.{tsx,css}"
---

# RTL and LTR

Arabic is the default language and renders right-to-left; English renders
left-to-right. Both are first-class: every screen must be correct in both
directions, so write direction-neutral code, not RTL code patched for LTR or
the reverse.

`<html dir lang>` is set from the language in one place (the root route /
app shell; `CLAUDE.md` names it). Website (TanStack Start): it is rendered on
the server, so the first HTML already has the right `dir`. Components inherit
it — never hardcode `dir="rtl"` or `dir="ltr"` on a layout container.

## Logical utilities only

| Don't | Do |
| ----- | -- |
| `pl-4`, `pr-4` | `ps-4`, `pe-4` |
| `ml-2`, `mr-2` | `ms-2`, `me-2` |
| `left-0`, `right-0` | `start-0`, `end-0` |
| `text-left`, `text-right` | `text-start`, `text-end` |
| `border-l`, `border-r` | `border-s`, `border-e` |
| `rounded-l-*`, `rounded-r-*` | `rounded-s-*`, `rounded-e-*` |
| `[[dir=rtl]_&]:pl-6 [[dir=ltr]_&]:pr-6` | `pe-6` |

In CSS: `padding-inline-start`, `margin-inline-end`, `inset-inline-start`.
Physical `left` / `right` only for things that are genuinely visual
(transforms, a decorative image that must not mirror). Older code with
`[[dir=rtl]_&]:` pairs: replace them with one logical utility when you touch it.

## Directional icons

Pick the icon that is correct in **LTR** and mirror it in RTL:

```tsx
<ChevronRight className="size-4 rtl:-scale-x-100" aria-hidden="true" />   // "next" / "forward"
<ArrowLeft className="size-5 rtl:-scale-x-100" aria-hidden="true" />      // "back"
```

Mirror arrows, chevrons, "send" and progress icons. Never mirror
non-directional icons (search, cart, close, check, bell) or brand logos.
Carousels, sliders and swipe gestures read the computed direction
(`getComputedStyle(element).direction`) rather than assuming one.

## Inputs

- A free-text input follows what the user types: `dir="auto"` once it has a
  value. An empty field has no content to infer from and browsers fall back
  to LTR, which left-aligns an Arabic placeholder — so while empty it uses the
  UI direction (`i18n.dir()`).
- Content that is always Latin or digits — phone numbers, OTP, card numbers,
  emails, codes, URLs — gets `dir="ltr"` on the value. Keep its placeholder
  in the UI direction with `rtl:placeholder-shown:[direction:rtl]` on the input.
- Don't add `text-start` / `text-end` to "fix" alignment; the resolved
  direction already aligns the text.
- A reusable text field carries the two-part rule above inside it, so every
  caller gets it for free.

## Tables and charts (dashboard)

Columns follow reading order: the first column sits at the start (right in
Arabic). Numeric columns align to the end and use `tabular-nums`. Whether a
chart's time axis mirrors in Arabic is a design decision — follow the frame,
or ask.

## Mixed content

Phone numbers, order numbers, codes, prices with Latin currency codes and
URLs stay LTR inside Arabic text:

```tsx
<span dir="ltr" className="tabular-nums">+1 555 010 0199</span>
```

Numbers stay Western digits in both languages unless `CLAUDE.md` says
otherwise; use `tabular-nums` for prices and counters. Format money and dates
through the project's formatters.

## Checking

Walk every changed screen in Arabic and English, at phone width and desktop
width. Playwright e2e runs both languages; assert `html[dir]` when layout
direction matters.
