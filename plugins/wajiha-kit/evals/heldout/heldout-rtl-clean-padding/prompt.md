---
name: heldout-rtl-clean-padding
description: RTL check of one snippet (already clean).
tags: [rtl, heldout]
runs: 3
max_turns: 5
allowed_tools: [Skill, Read, Glob, Grep]
---

This component ships in an Arabic (RTL) and English (LTR) app. Fix any RTL problems and show the corrected component. If it needs no change, say so.

```tsx
export const Pad = () => (
  <div className="flex gap-4 ps-6 pe-2 text-center">Pad</div>
)
```
