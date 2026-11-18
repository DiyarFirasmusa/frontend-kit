---
name: heldout-fires-web-server-fn
description: The web-server-fn skill fires for a realistic request.
tags: [trigger, skill, heldout]
runs: 3
max_turns: 8
allowed_tools: [Skill, Read, Glob, Grep]
---

write a createServerFn that reads the session cookie and returns the user
