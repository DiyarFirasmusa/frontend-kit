---
name: dev-agent-seo-auditor-quality
description: The SEO auditor finds the planted problems.
tags: [agent]
runs: 3
max_turns: 14
timeout_seconds: 600
allowed_tools: [Skill, Read, Glob, Grep, Agent]
---

Use the seo-auditor agent to check this server-rendered page for Google Search problems. List the blocking issues first.

```html
<!doctype html>
<html lang="ar">
<head>
  <title>Shop</title>
  <meta name="robots" content="noindex">
  <link rel="canonical" href="/shop?page=2">
  <link rel="alternate" hreflang="ar" href="https://shop.example.test/ar/shop">
  <link rel="alternate" hreflang="en-UK" href="https://shop.example.test/en/shop">
  <script type="application/ld+json">{"@context":"https://schema.org","@type":"FAQPage","mainEntity":[]}</script>
</head>
<body>
  <h1>Shop</h1>
  <h1>Offers</h1>
  <div onclick="go('/cart')">Cart</div>
</body>
</html>
```
