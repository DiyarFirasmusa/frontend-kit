# Wajiha Kit: identity and design system

This is the one place that says how the site looks and why. Change the site by changing the law here first, then the code.

## 1. What the identity is

The mark is four rounded blocks: an ivory bar on top, an orange block, a tall column, an ivory bar below. **The mark is the layout.** Every part of the home page is a *board*: the mark made big. A visitor who has seen one part knows what the next one will look like.

Two colours carry all the meaning:

| Colour | Hex (dark / light) | Means |
|---|---|---|
| Orange | `#d97757` / `#c4623a` | You act (the request, the button, the step you take) |
| Turquoise | `#19abab` / `#0c8a8a` | You get, or you go there (result, link, focus, tick) |
| Ivory | `#f1ede7` | Words on dark, the page on light |
| Black | `#050607` | The page on dark |

No other brand colour. Red is only for a deliberate error in an example. No glows, no gradients behind titles, no decorative 3D: colour lives in the blocks.

## 2. The board (the one layout)

```
┌──────────────────────────────────────────┐
│ ▤ n/4  LABEL                             │  dark bar: the mark with this part's block lit, the counter, the name
├────────────────────────────┬─────────────┤
│                            │ TITLE       │
│   main block               │ ✓ point     │  main block: orange = you act, dark ink = you look
│   (a dark window inside)   │ ✓ point     │  side column (neutral dark): what you get / need, rows share the height
│                            │ ✓ point     │
├────────────────────────────┤             │
│ note                  [pill]│             │  dark note bar: words at the start, the ONE action at the end
└────────────────────────────┴─────────────┘
```

Rules:

1. A part is **title, then lead, then one board at the column's width**. The hero is the only split (text beside the board) and shows the whole logo.
2. The bar's lit block says which part you are in: 1 top bar, 2 orange block, 3 turquoise column, 4 bottom bar.
3. The main block holds **one drawing**: a window of the Claude app, a browser, the comparison. Every drawing is the same window: a bar, three lights, the stamp.
4. The side column always has a title and rows with a drawn tick. It never stands empty.
5. The action of a part is the pill at the end of its note bar: an orange pill for "you act", a ghost pill for links.
6. On the **dark theme** each block is a dark surface with its colour as an edge and a soft tint, words light; the **side column is the neutral dark surface** (decided by the owner: calmer than a turquoise slab). In **light mode** the main blocks are the solid colours of the mark with dark words, the side column a warm grey, and the bars paper-dark with dark words. The drawings of the Claude app (chat, browser, comparison, code windows) stay dark in both themes.
7. The board keeps the logo's left-to-right shape in both languages; the words inside run right to left in Arabic.

## 3. Pages that are read

Guide and legal pages are the same law at a lower volume:

- The head is a board: a dark bar (mark, the kind's block lit, the section name) and one block holding the H1 and the lead. Orange for pages you use to act (get started, skills), dark ink for reference and trust pages (rules, specialists, checks, legal).
- The body is calm reading: 68ch paragraphs, hairline rules, flat rows (no boxed cards), the page list on the start side, "On this page" on the end side.
- Orange step numbers (what you do), turquoise ticks (what you get).

## 4. Type and spacing

- Latin: Familjen Grotesk. Arabic: IBM Plex Sans Arabic (larger by one step than Latin at the same role, line height 1.8). Code: IBM Plex Mono.
- Labels above titles: mono, uppercase, 0.08em, 13px (Arabic: sans, no uppercase, 15px).
- Sections breathe on a 4rem to 5.5rem rhythm; boards use a 0.5rem gap and 0.7rem to 0.9rem corners.
- Tap targets are at least 44px. Focus is a turquoise outline.

## 5. Light mode

A button in the header switches (dark is the default, the choice is kept in `localStorage` as `wajiha-theme`). Light mode flips the tokens in `site/src/styles/theme-light.css`; drawings of the Claude app stay dark, bars become paper-dark with dark words, orange and turquoise are a step deeper for contrast.

## 6. Copy

Plain words for someone who does not code; each technical word is explained where it first appears. The kit is free: no price figures. The only person named is Diyar Firas (GitHub and LinkedIn). Arabic is simple Modern Standard Arabic written from the English, not translated word for word.

## 7. Where it lives in the code

| What | File |
|---|---|
| Tokens (colours, ink) | `site/src/styles/tokens.css` |
| The board component | `site/src/components/home/Board.astro` |
| The board styles | `site/src/styles/docs-space.css` (end of file) |
| Light mode | `site/src/styles/theme-light.css`, `site/src/client/theme.ts` |
| Page heads | `site/src/components/DocPage.astro` |
| Share images | `site/design/og/og.html` |
| The mark | `brand/logo/` |

## 8. Review log

Designer critic rounds with the scores they gave are in the repository history (`feat(site)` and `fix(site)` commits from 2026-11-25). A new part is accepted when professional critics score it at least 9 on identity, UI, readability, marketing clarity, craft, Arabic, mobile and light mode.

## 9. The law in the words of a page (added after the whole-site audit)

- Every guide and legal page **ends in a note bar**: where to go next at the start, one pill at the end (a ghost pill for previous/next).
- **Steps keep their meaning everywhere:** orange squares and an orange edge are steps *you* take (get started); turquoise are steps *the kit* takes (what the assistant then does). Ticks and "what you get" lists have a turquoise edge.
- A small block before each section title says which kind of section it is: orange where you act, turquoise where you get, plain where you look.
- A **prompt** (what you can say) is a flat row with an orange edge. **Code you copy** is one dark window with an orange edge and an orange copy pill.
- One disclosure: a turquoise plus, no native triangle.
- The header's two settings (theme, language) are quiet ink squares, not turquoise: turquoise means "go there".
- The **404** is an empty board (bar "404", a block with the message, a side column of nearby pages, a note bar with the one pill).
- No tinted light anywhere behind titles or drawings; the ground is plain black (or paper in light mode).
