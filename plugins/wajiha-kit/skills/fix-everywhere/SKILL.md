---
name: fix-everywhere
description: Apply a fix to every occurrence of a pattern across the project — find them all, fix each on the same branch, and prove none are left with a final grep. Use when the user says "all", "every", "check all", "cheak all", "other pages", "everywhere", "did you forget any", or a fixed bug is a pattern (a dropdown, spacing, layout shift, missing translation, barrel import).
argument-hint: "<what to fix everywhere>"
---

# Fix everywhere

## 1. Define the pattern

Write down, in one line, what makes an occurrence: the component, class,
import, prop, API call or markup shape. Then the search(es) that find it —
usually more than one spelling (`Select` vs `select`, `pl-` vs `ps-`, a
component and its copy-pasted twin).

## 2. Find every occurrence

Grep the whole of `src/` (and `e2e/` when tests are part of it), not only the
folder you were in. Include sibling patterns that do the same job by other
means (a hand-rolled dropdown next to the shared one).

Print the list before changing anything: `file:line — what it is`. For more
than ~15 occurrences or any that need a product decision, show the list and
ask before fixing.

## 3. Fix each one

The same fix, adapted to each place; a shared component or util when 3+ places
repeat the same code. Keep each occurrence's behaviour otherwise unchanged.
Translations: Arabic and English together. Tests follow the change.

## 4. Prove it

Run the same searches again and show the result: zero remaining (or the
deliberate exceptions, each with its reason). Then the `verify` gates.

Report: the count fixed, the file list, the final grep and its (empty) output.
