---
name: dev-agent-planner-no-code
description: The planner plans and never writes code.
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the planner agent to plan a customers module (list, detail, create, edit, delete). Return the work packages with disjoint file ownership. No code.
