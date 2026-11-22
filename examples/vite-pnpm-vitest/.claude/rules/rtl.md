---
paths:
  - "src/**/*.{tsx,css}"
  - "index.html"
---

# RTL and LTR

> **Plain CSS** (`stack.styling` is not Tailwind): the same principles with custom-property tokens, logical properties
> (`margin-inline-start`, `padding-inline`), `[dir='rtl']` for the few mirrored things and a `prefers-color-scheme` dark token
> set. The Tailwind utilities below are examples of the intent, not required syntax.

> **No i18n library yet** (`stack.i18n` in `.claude/frontend-kit.json`): keep every user-visible string in one catalogue
> module grouped like future keys (`group.key`), no text in JSX, no second language or library without asking. The rules below
> then apply to that catalogue.

For a project with a right-to-left language; Arabic (the default here) and English are the kit's example pair.
Each direction is first-class: every screen must be correct in both
directions, so write direction-neutral code, not RTL code patched for LTR or
the reverse.

`<html dir lang>` is set from the language in one place (the root route /
app shell; `project.md` names it). Website (TanStack Start): it is rendered on
the server, so the first HTML already has the right `dir`. Components inherit
it — never hardcode `dir="rtl"` or `dir="ltr"` on a layout container.

## Logical utilities only

| Don't | Do |
| ----- | -- |
| `pl-4`, `pr-4` | `ps-4`, `pe-4` |
| `ml-2`, `mr-2` | `ms-2`, `me-2` |
| `left: 0`, `right: 0` | `inset-inline-start: 0`, `inset-inline-end: 0` |
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

- A free-text input follows what the user types and, while empty, the UI direction. One mechanism does both: every input
  renders `placeholder=" "` and the base styles apply `unicode-bidi: plaintext` to `input:not(:placeholder-shown)`
  (`src/index.css`). No `dir="auto"` on inputs: it left-aligns an empty Arabic field.
- Content that is always Latin or digits — phone numbers, OTP, card numbers,
  emails, codes, URLs — gets `dir="ltr"` on the value. Keep its placeholder
  in the UI direction with `rtl:placeholder-shown:[direction:rtl]` on the input.
- Don't add `text-start` / `text-end` to "fix" alignment; the resolved
  direction already aligns the text.
- A reusable text field carries the two-part rule above inside it, so every
  caller gets it for free.

## Tables and charts (dashboard)

Columns follow reading order: the first column sits at the start (right in
Arabic). Numeric columns align to the end and use `tabular-nums`. Charts and time axes stay left-to-right (`dir="ltr"` on
the chart) with Arabic labels, unless `project.md` records another decision.

## Mixed content

Phone numbers, order numbers, codes, prices with Latin currency codes and
URLs stay LTR inside Arabic text:

```tsx
<span dir="ltr" className="tabular-nums">+1 555 010 0199</span>
```

User text of unknown direction (a name, a comment, a title from the API) inside a sentence goes in `<bdi>`.

Numbers stay Western digits in both languages unless `project.md` says
otherwise; use `tabular-nums` for prices and counters. Format money and dates
through the project's formatters.

## Checking

Walk every changed screen in Arabic and English, at phone width and desktop
width. Playwright e2e runs both languages; assert `html[dir]` when layout
direction matters.

## Details that cost time

- **Physical transforms and origins do not mirror:** `translateX()`, `transform-origin: left`, `background-position: left`
  and `linear-gradient(to right, …)` keep their direction. Flip them under `[dir='rtl']`, or move the element with a
  logical margin.
- **`scrollLeft` is 0 at the start and negative in RTL.** Compare with 0 for the start; use `Math.abs(scrollLeft)` for
  distance and for "reached the end".
- **`text-transform: uppercase` does nothing to Arabic,** and letter-spacing stays 0 on it.
- **One mirror utility** for directional icons and arrows: `rtl:-scale-x-100`. Not `rotate-180`.
