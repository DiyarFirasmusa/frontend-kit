/** A promise a test settles by hand (`Promise.withResolvers` before ES2024). */
export function deferred(): { promise: Promise<void>; resolve: () => void } {
  // Assigned synchronously by the Promise executor below.
  let resolve!: () => void;
  const promise = new Promise<void>((done) => {
    resolve = done;
  });
  return { promise, resolve };
}
