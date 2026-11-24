# Svelte, when the project has no shared state yet
- Svelte 5: `$state` and `$derived` in a `.svelte.ts` or `.svelte.js` module. Older: `svelte/store`.
- Expose getters and actions. A reassigned `$state` cannot be exported.
- With server rendering pass state by context, never as a module singleton holding user data.
