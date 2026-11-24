---
name: dev-rtl-bad-text-right
description: RTL check of one snippet (needs a fix).
tags: [rtl]
runs: 3
max_turns: 5
allowed_tools: [Skill, Read, Glob, Grep]
---

This component ships in an Arabic (RTL) and English (LTR) app. Fix any RTL problems and show the corrected component. If it needs no change, say so.

```tsx
export const Price = () => (
  <p className="text-right font-bold">12.50</p>
)
```
