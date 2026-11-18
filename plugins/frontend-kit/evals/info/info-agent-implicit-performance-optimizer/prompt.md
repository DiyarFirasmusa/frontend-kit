---
name: info-agent-implicit-performance-optimizer
description: The performance-optimizer agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

The product listing page feels slow on phones and Lighthouse shows poor LCP and layout shift. Find the measured problems in this page.

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
