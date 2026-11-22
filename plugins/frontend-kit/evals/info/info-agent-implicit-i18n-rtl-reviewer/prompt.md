---
name: info-agent-implicit-i18n-rtl-reviewer
description: The i18n reviewer is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

I added the cart strings in Arabic and English and changed the layout. Anything wrong before I commit?

```json
{ "cart": { "itemsCount_one": "عنصر واحد", "itemsCount_other": "{{count}} عناصر" } }
```
```tsx
<div className="ml-4 text-left">{t('cart.itemsCount', { count })}</div>
```
