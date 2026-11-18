---
name: info-agent-implicit-frontend-reviewer
description: The frontend-reviewer agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

I'm about to commit this change. Do a senior review of it first.

```diff
--- a/src/features/cart/cart-badge.tsx
+++ b/src/features/cart/cart-badge.tsx
@@
-export const CartBadge = ({ count }: { count: number }) => <span>{count}</span>
+export const CartBadge = ({ count }: { count: any }) => {
+  const [items, setItems] = useState([])
+  useEffect(() => { fetch('/api/cart').then(r => r.json()).then(setItems) }, [])
+  return <span style={{ marginLeft: 8 }} onClick={() => navigate('/cart')}>{count} items</span>
+}
```
