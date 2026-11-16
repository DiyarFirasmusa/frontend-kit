---
name: heldout-rtl-bad-negative
description: RTL check of one snippet (needs a fix).
tags: [rtl, heldout]
runs: 3
max_turns: 5
allowed_tools: [Skill, Read, Glob, Grep]
---

This component ships in an Arabic (RTL) and English (LTR) app. Fix any RTL problems and show the corrected component. If it needs no change, say so.

```tsx
export const Pull = () => (
  <div className="-ml-2 text-right">Pull</div>
)
```
