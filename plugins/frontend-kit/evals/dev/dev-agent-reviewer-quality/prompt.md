---
name: dev-agent-reviewer-quality
description: The reviewer finds the planted problems.
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the frontend-reviewer agent to review this component and report what is wrong:

```tsx
import { useEffect, useState } from 'react'

export function OrdersTable({ status }: { status: string }) {
  const [rows, setRows] = useState<any>([])
  useEffect(() => {
    fetch('/api/orders?status=' + status).then((r) => r.json()).then((d) => setRows(d.data))
  }, [status])
  return (
    <div className="ml-4 text-left">
      <h2>Orders</h2>
      {rows.map((o: any) => (
        <div key={o.id} onClick={() => (window.location.href = '/orders/' + o.id)}>
          {o.name} - {o.total} SAR
        </div>
      ))}
    </div>
  )
}
```
