---
name: dev-rtl-clean-word-left
description: RTL check of one snippet (already clean).
tags: [rtl]
runs: 3
max_turns: 5
allowed_tools: [Skill, Read, Glob, Grep]
---

This component ships in an Arabic (RTL) and English (LTR) app. Fix any RTL problems and show the corrected component. If it needs no change, say so.

```tsx
// scroll left when the list ends
export const Panel = () => (
  <aside className="start-0 end-4 text-end" aria-label="left panel">Panel</aside>
)
```
