---
name: info-agent-implicit-frontend-dev
description: The frontend-dev agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Implement this one well-scoped change: add a 'Mark as read' button to the notification row component below, calling `markRead(id)` from the notifications service.

```tsx
// src/features/notifications/components/notification-row.tsx
export function NotificationRow({ item }: { item: Notification }) {
  return <li className="flex gap-2"><span>{item.title}</span></li>
}
```
