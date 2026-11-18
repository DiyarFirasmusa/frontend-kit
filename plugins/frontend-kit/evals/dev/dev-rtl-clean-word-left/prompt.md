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
import { useTranslation } from 'react-i18next'

export const Panel = ({ leftoverCount }: { leftoverCount: number }) => {
  const { t } = useTranslation()
  return (
    <aside className="start-0 end-4 text-end" aria-label={t('panel.label')}>
      {t('panel.title', { count: leftoverCount })}
    </aside>
  )
}
```
