// A tiny reader for the raw server HTML, so the specs can check what a crawler or a chat app receives
// without running any JavaScript. Attribute names are compared in lowercase (HTML is case-insensitive).
export type Tag = Record<string, string>;

const ENTITIES: Record<string, string> = {
  '&amp;': '&',
  '&lt;': '<',
  '&gt;': '>',
  '&quot;': '"',
  '&#x27;': "'",
  '&#39;': "'",
};

function decode(value: string): string {
  return value.replace(/&(?:amp|lt|gt|quot|#x27|#39);/g, (entity) => ENTITIES[entity] ?? entity);
}

/** All tags of one name, as attribute maps. */
export function tags(html: string, name: 'meta' | 'link' | 'script' | 'html' | 'a'): Tag[] {
  const found: Tag[] = [];
  const pattern = new RegExp(`<${name}\\b([^>]*)>`, 'gi');
  for (const match of html.matchAll(pattern)) {
    const attributes: Tag = {};
    for (const attribute of (match[1] ?? '').matchAll(/([\w:-]+)(?:="([^"]*)")?/g)) {
      attributes[(attribute[1] ?? '').toLowerCase()] = decode(attribute[2] ?? '');
    }
    found.push(attributes);
  }
  return found;
}

export function metaContent(
  html: string,
  key: 'name' | 'property',
  value: string,
): string | undefined {
  return tags(html, 'meta').find((tag) => tag[key] === value)?.['content'];
}

export function allMeta(html: string, key: 'name' | 'property', value: string): string[] {
  return tags(html, 'meta')
    .filter((tag) => tag[key] === value)
    .map((tag) => tag['content'] ?? '');
}

export function titles(html: string): string[] {
  return [...html.matchAll(/<title[^>]*>([^<]*)<\/title>/gi)].map((match) =>
    decode(match[1] ?? ''),
  );
}

export function h1Count(html: string): number {
  return [...html.matchAll(/<h1\b/gi)].length;
}

export function canonical(html: string): string | undefined {
  return tags(html, 'link').find((tag) => tag['rel'] === 'canonical')?.['href'];
}

export function alternates(html: string): Record<string, string> {
  const result: Record<string, string> = {};
  for (const tag of tags(html, 'link')) {
    if (tag['rel'] === 'alternate' && tag['hreflang'] !== undefined && tag['href'] !== undefined) {
      result[tag['hreflang']] = tag['href'];
    }
  }
  return result;
}

/** The parsed JSON-LD blocks of the page. */
export function jsonLd(html: string): Array<Record<string, unknown>> {
  return [
    ...html.matchAll(/<script[^>]*type="application\/ld\+json"[^>]*>([\s\S]*?)<\/script>/gi),
  ].map((match) => JSON.parse(match[1] ?? '{}') as Record<string, unknown>);
}

/** The width and height of a PNG, read from its IHDR chunk. */
export function pngSize(bytes: Buffer): { width: number; height: number } {
  const signature = bytes.subarray(0, 8).toString('hex');
  if (signature !== '89504e470d0a1a0a') {
    throw new Error('not a PNG file');
  }
  return { width: bytes.readUInt32BE(16), height: bytes.readUInt32BE(20) };
}
