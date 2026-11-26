import {
  DEFAULT_LOCALE,
  isLocale,
  LOCALE_COOKIE,
  negotiateLocale,
  type Locale,
} from '@/shared/lib/i18n/languages';

function cookieValue(cookieHeader: string | null, name: string): string | undefined {
  if (cookieHeader === null) {
    return undefined;
  }
  for (const part of cookieHeader.split(';')) {
    const [key, ...rest] = part.trim().split('=');
    if (key === name) {
      return rest.join('=');
    }
  }
  return undefined;
}

/** The visitor's saved choice, then the browser's language, then the site default. */
export function chooseLocale(request: Request): Locale {
  const saved = cookieValue(request.headers.get('cookie'), LOCALE_COOKIE);
  if (isLocale(saved)) {
    return saved;
  }
  return negotiateLocale(request.headers.get('accept-language')) ?? DEFAULT_LOCALE;
}

/**
 * "/" has no content of its own: it sends the visitor to a language home. 302 (temporary), because the
 * target depends on who is asking; Vary tells caches so.
 */
export function redirectToLocale(request: Request): Response {
  const url = new URL(request.url);
  return new Response(null, {
    status: 302,
    headers: {
      Location: `/${chooseLocale(request)}${url.search}`,
      Vary: 'Accept-Language, Cookie',
      'Cache-Control': 'private, no-store',
    },
  });
}
