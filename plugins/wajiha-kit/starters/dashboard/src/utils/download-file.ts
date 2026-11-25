const FILENAME_STAR_RE = /filename\*\s*=\s*(?:UTF-8|utf-8)''([^;]+)/;
const FILENAME_RE = /filename\s*=\s*(?:"([^"]+)"|([^;]+))/;

/** File name from a Content-Disposition header, or `fallback` when absent. */
export function parseContentDispositionFilename(
  header: unknown,
  fallback: string,
): string {
  if (typeof header !== 'string' || header === '') {
    return fallback;
  }
  const star = FILENAME_STAR_RE.exec(header);
  if (star?.[1]) {
    try {
      return decodeURIComponent(star[1].trim());
    } catch {
      return fallback;
    }
  }
  const plain = FILENAME_RE.exec(header);
  const name = (plain?.[1] ?? plain?.[2] ?? '').trim();
  return name === '' ? fallback : name;
}

/** Hand a Blob to the browser as a file download. */
export function saveBlob(blob: Blob, filename: string): void {
  const url = URL.createObjectURL(blob);
  const anchor = document.createElement('a');
  anchor.href = url;
  anchor.download = filename;
  anchor.rel = 'noopener';
  document.body.append(anchor);
  anchor.click();
  anchor.remove();
  URL.revokeObjectURL(url);
}
