---
name: dev-agent-upgrade-analyst-quality
description: The upgrade analyst maps the breaking changes to the code.
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the upgrade-analyst agent: plan the upgrade of React 18 to React 19 for this project. Plan only, change nothing, and do not run any codemod.

```tsx
// src/main.tsx
import ReactDOM from 'react-dom'
ReactDOM.render(<App />, document.getElementById('root'))
```
```tsx
// src/components/price.tsx
export function Price({ value }: { value: number }) {
  return <span>{value}</span>
}
Price.defaultProps = { value: 0 }
```
```tsx
// src/components/measure.tsx
import { findDOMNode } from 'react-dom'
export function measure(instance: React.Component) {
  return findDOMNode(instance)
}
```
