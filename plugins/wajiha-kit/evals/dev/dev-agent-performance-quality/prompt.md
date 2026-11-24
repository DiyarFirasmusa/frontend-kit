---
name: dev-agent-performance-quality
description: "Explicit agent request; the agent must find the planted problems."
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the performance-optimizer agent on this page and list the problems:

```tsx
import * as icons from 'lucide-react'
import _ from 'lodash'
export function Listing() {
  const [products, setProducts] = useState<Product[]>([])
  useEffect(() => { getProducts().then(setProducts) }, [])
  useEffect(() => { products.forEach((p) => getReviews(p.id)) }, [products])
  return <div>{_.sortBy(products, 'price').map((p) => <img src={p.imageUrl} />)}</div>
}
```
