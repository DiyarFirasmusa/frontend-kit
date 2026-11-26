// How a failed page is recognised and described. Reads only the public `status` of the route matches:
// a thrown notFound() (a missing article, or the splat routes for an unmatched URL) and a thrown error.

export type Failure = 'notFound' | 'error';

export function failureOf(matches: readonly { status: string }[]): Failure | undefined {
  if (matches.some((match) => match.status === 'notFound')) {
    return 'notFound';
  }
  return matches.some((match) => match.status === 'error') ? 'error' : undefined;
}

type FailedMeta = { title: string } | { name: 'robots'; content: string };

/** Title and robots meta of a failed page. Real pages set theirs through seo(); a failed page is never indexed. */
export function failedMeta(
  failure: Failure | undefined,
  title: (key: 'error.notFoundTitle' | 'error.errorTitle') => string,
): FailedMeta[] {
  if (failure === undefined) {
    return [];
  }
  return [
    { title: title(failure === 'notFound' ? 'error.notFoundTitle' : 'error.errorTitle') },
    { name: 'robots', content: 'noindex, nofollow' },
  ];
}
