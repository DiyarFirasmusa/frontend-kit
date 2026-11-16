---
name: dev-rtl-bad-pair
description: RTL check of one snippet (needs a fix).
tags: [rtl]
runs: 3
max_turns: 5
allowed_tools: [Skill, Read, Glob, Grep]
---

This component ships in an Arabic (RTL) and English (LTR) app. Fix any RTL problems and show the corrected component. If it needs no change, say so.

```tsx
export const Tag = () => (
  <i className="ml-2 mr-2 inline-block" />
)
```
