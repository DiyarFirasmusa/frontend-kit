# Angular, when the project has no shared state yet
- An installed state library wins (NgRx, NGXS).
- Else built in: an injectable service with a private `signal`, read-only outside, derived values with `computed`.
- Reach browser storage through an injected abstraction.
