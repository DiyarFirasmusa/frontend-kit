---
name: info-agent-implicit-refactor-architect
description: The refactor-architect agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

This component file is too big and mixes concerns. Plan and carry out a refactor that splits it and moves the pieces to match our folder layout (features/<feature>/components, hooks, services).

```tsx
// src/pages/orders.tsx  (900 lines in the real file; this is its outline)
// 1. fetchOrders / updateOrder / deleteOrder API calls written inline
// 2. useState/useEffect filter + pagination logic (200 lines)
// 3. OrdersTable JSX with 6 inline row components (300 lines)
// 4. EditOrderDialog with its own form state (150 lines)
// 5. formatCurrency, formatDate helpers copied in this file
```
