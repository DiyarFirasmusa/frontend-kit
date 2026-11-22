---
name: info-agent-implicit-seo-auditor
description: The SEO auditor is chosen for a request that does not name it.
tags: [agent, info]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Before we launch the shop page, will Google index it properly? Here is the head.

```html
<head>
  <title>Shop</title>
  <meta name="robots" content="noindex">
  <link rel="canonical" href="/shop?page=2">
  <script type="application/ld+json">{"@type":"FAQPage","mainEntity":[]}</script>
</head>
```
