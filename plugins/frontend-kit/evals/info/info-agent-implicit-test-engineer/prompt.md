---
name: info-agent-implicit-test-engineer
description: The test-engineer agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

The new ProductCard feature is finished. Write and run the tests for it, including component tests.

```tsx
// src/components/product-card.tsx
export function ProductCard({ name, price, inStock, onAdd }: Props) {
  return (
    <article>
      <h3>{name}</h3><p>{price}</p>
      {!inStock && <span>Out of stock</span>}
      <button disabled={!inStock} onClick={onAdd}>Add to cart</button>
    </article>
  )
}
```
