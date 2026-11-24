---
name: info-agent-implicit-bug-hunter
description: The bug-hunter agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

The orders page crashes with "Cannot read properties of undefined (reading 'map')" right after I pick a status filter. I don't know why. Find the root cause.

```tsx
export function Orders() {
  const [status, setStatus] = useState('all')
  const { data } = useQuery({ queryKey: ['orders', status], queryFn: () => getOrders(status) })
  return (
    <>
      <StatusSelect value={status} onChange={setStatus} />
      {data.items.map((o) => <OrderRow key={o.id} order={o} />)}
    </>
  )
}
// getOrders(status) returns { items: Order[] } for 'all' but { data: Order[] } for any other status
```
