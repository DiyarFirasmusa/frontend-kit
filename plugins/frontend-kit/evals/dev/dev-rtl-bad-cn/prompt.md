---
name: dev-rtl-bad-cn
description: RTL check of one snippet (needs a fix).
tags: [rtl]
runs: 3
max_turns: 5
allowed_tools: [Skill, Read, Glob, Grep]
---

This component ships in an Arabic (RTL) and English (LTR) app. Fix any RTL problems and show the corrected component. If it needs no change, say so.

```tsx
export const Menu = ({ isOpen }: { isOpen: boolean }) => (
  <nav className={cn('flex gap-2', isOpen && 'ml-8')}>Menu</nav>
)
```
