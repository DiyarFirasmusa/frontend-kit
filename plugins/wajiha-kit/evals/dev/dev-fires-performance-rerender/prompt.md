---
name: dev-fires-performance-rerender
description: The performance skill fires for a realistic request.
tags: [trigger, skill, dev]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---

audit this React page for re-render and bundle size problems:

```tsx
import _ from 'lodash'
import moment from 'moment'

export function Dashboard({ items }: { items: Item[] }) {
  const [q, setQ] = useState('')
  const sorted = _.sortBy(items, (i) => moment(i.createdAt).valueOf())
  return (
    <Ctx.Provider value={{ q, setQ }}>
      {sorted.map((i) => <Row key={i.id} item={i} onPick={() => setQ(i.name)} />)}
    </Ctx.Provider>
  )
}
```
