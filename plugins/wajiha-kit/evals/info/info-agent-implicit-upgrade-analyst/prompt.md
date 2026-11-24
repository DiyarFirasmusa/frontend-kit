---
name: info-agent-implicit-upgrade-analyst
description: The upgrade analyst is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

We have to move to Tailwind v4 next month. Which of our code will break, and in what order should we change it? Plan only.

```js
// tailwind.config.js
module.exports = { content: ['./src/**/*.{ts,tsx}'], theme: { extend: {} }, plugins: [] }
```
```css
/* src/index.css */
@tailwind base;
@tailwind components;
@tailwind utilities;
```
