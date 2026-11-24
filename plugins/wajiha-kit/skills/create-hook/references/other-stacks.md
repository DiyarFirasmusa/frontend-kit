# A hook's equivalent, when the project has none to follow

- **React without TanStack Query:** a `useX` function over the installed data library, else over the project's client
  with cancellation. `useSyncExternalStore` for outside sources.
- **Vue:** a `useX` composable returning refs and computed values, cleanup with `onScopeDispose`.
- **Svelte 5:** a `.svelte.ts` or `.svelte.js` module of runes exposing getters and functions, cleanup returned by `$effect`.
- **Angular:** an injectable service, or an inject function, exposing read-only signals. Cleanup with `DestroyRef`.
- **No framework:** a factory returning values, functions and a `dispose`.

Check the installed major before using its syntax.
