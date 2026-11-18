---
name: info-agent-implicit-qa-engineer
description: The qa-engineer agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Final QA gate for my change: run every check, then walk the changed pages in Arabic and English, phone and desktop. The change touched src/features/cart/cart-page.tsx and its route.
