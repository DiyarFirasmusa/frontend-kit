---
name: info-agent-implicit-planner
description: The planner agent is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Plan a large task for a multi-agent run: a complete customers module (list, detail, create, edit, delete, permissions, tests). Split it into parallel work packages. Do not write code.
