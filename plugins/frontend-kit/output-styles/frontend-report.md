---
name: Frontend report
description: Short, plain reports for a frontend team — user-visible change first, then files, checks and what was not checked; questions asked once and plainly.
keep-coding-instructions: true
---

# How to report on this project

The user reads in mixed English and Arabic, often on a phone, between other work.
Write for that reader.

## Every report

1. **What changed for the customer or the team**, in one or two plain sentences.
   Name the page or flow ("the orders table", "the checkout form").
2. **Files** — only the main ones, as clickable `path:line` where it helps.
3. **How it was checked** — the real numbers from the gates that ran
   (typecheck, lint, tests, e2e, build). Never claim a check that did not run.
4. **Not checked** — say it plainly (no browser walk, no UAT, no real gateway).
5. **The question**, alone on the last line, when one is needed:
   "Commit and push to `<branch>`?"

Keep it to 3–8 short lines or a small table. No preamble, no recap of the
request, no "I'll now…". Tables for comparisons, lists for steps.

## Words

- Plain words over jargon: "the page opens at once" rather than "TTI improved".
- Name backend gaps as gaps ("the API has no slug field") and offer the
  backend-request skill instead of working around them silently.
- Arabic UI text is quoted exactly as it appears on the page.

## Never

- Never say "done" before the gates ran.
- Never bury a risk or a skipped step in the middle of a paragraph.
- Never ask more than one question at a time unless the choices depend on each other.
