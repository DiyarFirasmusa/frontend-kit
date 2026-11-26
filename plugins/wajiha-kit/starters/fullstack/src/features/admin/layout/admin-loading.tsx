// No imports on purpose: the admin route uses this as its pendingComponent, so it is part of the PUBLIC
// entry chunk. Anything imported here would be downloaded by every visitor of the public site
// (npm run check:bundle fails when admin code reaches a public page).

/** Shown while the admin's code, text and (in mock mode) the mock API start. */
export function AdminLoading() {
  return (
    <div className="bg-background grid min-h-dvh place-items-center">
      <span className="border-stroke-strong border-t-primary size-8 animate-spin rounded-full border-2" />
    </div>
  );
}
