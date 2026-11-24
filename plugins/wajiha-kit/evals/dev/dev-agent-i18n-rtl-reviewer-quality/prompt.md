---
name: dev-agent-i18n-rtl-reviewer-quality
description: The i18n reviewer finds the planted problems.
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the i18n-rtl-reviewer agent to review this change for Arabic and English correctness.

```json
// src/locales/ar.json
{ "cart": { "itemsCount_one": "عنصر واحد", "itemsCount_other": "{{count}} عناصر" } }
```
```json
// src/locales/en.json
{ "cart": { "itemsCount_one": "{{count}} item", "itemsCount_other": "{{count}} items" } }
```
```tsx
// src/app/layout.tsx
export function Layout({ children, total }: { children: React.ReactNode; total: number }) {
  return (
    <html lang="ar" dir="ltr">
      <body>
        <div className="ml-4 text-left">{children}</div>
        <p>{new Intl.NumberFormat('en-US').format(total)} SAR</p>
        <button>Save</button>
      </body>
    </html>
  )
}
```
