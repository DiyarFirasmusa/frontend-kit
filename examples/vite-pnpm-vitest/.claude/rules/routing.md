# Routing and navigation

Follow the router the project uses (`stack.router`: Next.js, TanStack Router/Start, React Router/Remix, none).

- **Routes are thin**: the route file wires data loading, guards and the page component; no business logic.
- **Guards**: every route behind login redirects to sign-in and returns the user after login; redirect targets are
  validated as same-site paths (no open redirects).
- **Code-split by route**; heavy libraries (charts, editors, maps) load on demand.
- **Each page** sets its title and description; pages with a real "not found" return a real 404 status where the
  framework supports it. A client-only app cannot: its host falls back to the app shell for deep links, so say so.
- **Links are real links** (`<a>`/the framework's `Link`), so middle-click, copy and crawlers work; buttons are for actions.
- **Typed params and search params**: parse and validate them once at the route boundary, with defaults.
- **Focus and scroll**: after navigation move focus to the page's main heading and restore scroll sensibly.
