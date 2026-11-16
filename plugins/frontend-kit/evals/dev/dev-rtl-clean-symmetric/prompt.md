---
name: dev-rtl-clean-symmetric
description: RTL check of one snippet (already clean).
tags: [rtl]
runs: 3
max_turns: 5
allowed_tools: [Skill, Read, Glob, Grep]
---

This component ships in an Arabic (RTL) and English (LTR) app. Fix any RTL problems and show the corrected component. If it needs no change, say so.

```tsx
export const Box = () => (
  <section className="mx-auto flex gap-2 px-4 text-center">Hi</section>
)
```
