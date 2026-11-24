# React, when the project has no shared state yet
- An installed state library wins (Zustand, Redux Toolkit, Jotai, MobX).
- Else built in: a small module store read with `useSyncExternalStore`, or context for values that rarely change.
- Subscribe with selectors. Keep one stable server snapshot.
