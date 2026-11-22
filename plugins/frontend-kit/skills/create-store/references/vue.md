# Vue, when the project has no shared state yet
- An installed state library wins (Pinia, Vuex).
- Else built in: a composable over `reactive` or `ref`, exposed `readonly`, derived values with `computed`.
- With server rendering create the state per request, never as a module singleton.
