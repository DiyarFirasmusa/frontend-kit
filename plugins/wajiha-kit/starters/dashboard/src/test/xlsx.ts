import { vi } from 'vitest';

async function inflateRaw(data: Uint8Array): Promise<Uint8Array> {
  const stream = new Blob([data as BlobPart])
    .stream()
    .pipeThrough(new DecompressionStream('deflate-raw'));
  return new Uint8Array(await new Response(stream).arrayBuffer());
}

/** The files of a ZIP archive (stored or deflated), path → text. */
export async function unzipText(blob: Blob): Promise<Map<string, string>> {
  const bytes = new Uint8Array(await blob.arrayBuffer());
  const view = new DataView(bytes.buffer);
  const decoder = new TextDecoder();
  const files = new Map<string, string>();
  let offset = 0;
  while (view.getUint32(offset, true) === 0x04_03_4b_50) {
    const method = view.getUint16(offset + 8, true);
    const size = view.getUint32(offset + 18, true);
    const nameLength = view.getUint16(offset + 26, true);
    const extraLength = view.getUint16(offset + 28, true);
    const nameStart = offset + 30;
    const name = decoder.decode(bytes.slice(nameStart, nameStart + nameLength));
    const dataStart = nameStart + nameLength + extraLength;
    const data = bytes.slice(dataStart, dataStart + size);
    const content = method === 8 ? await inflateRaw(data) : data;
    files.set(name, decoder.decode(content));
    offset = dataStart + size;
  }
  return files;
}

/** Zero-based column index of a cell reference such as `C12`. */
function columnIndex(ref: string): number {
  const letters = /^[A-Z]+/.exec(ref)?.[0] ?? 'A';
  let index = 0;
  for (const letter of letters) {
    index = index * 26 + (letter.codePointAt(0) ?? 65) - 64;
  }
  return index - 1;
}

/**
 * The cell text of one sheet of an .xlsx file, row by row. Empty cells inside
 * a row read as `''`, so every value stays under its header.
 */
export async function readXlsxRows(blob: Blob, sheet = 1): Promise<string[][]> {
  const files = await unzipText(blob);
  const xml = files.get(`xl/worksheets/sheet${sheet}.xml`) ?? '';
  const doc = new DOMParser().parseFromString(xml, 'application/xml');
  return Array.from(doc.querySelectorAll('row')).map((row) => {
    const cells: string[] = [];
    for (const cell of Array.from(row.querySelectorAll('c'))) {
      const index = columnIndex(cell.getAttribute('r') ?? 'A');
      while (cells.length < index) {
        cells.push('');
      }
      cells[index] = cell.textContent ?? '';
    }
    return cells;
  });
}

/** The sheet names of an .xlsx file. */
export async function readXlsxSheetNames(blob: Blob): Promise<string[]> {
  const files = await unzipText(blob);
  const doc = new DOMParser().parseFromString(
    files.get('xl/workbook.xml') ?? '',
    'application/xml',
  );
  return Array.from(doc.querySelectorAll('sheet')).map(
    (sheet) => sheet.getAttribute('name') ?? '',
  );
}

/** Captures browser downloads: the saved blobs and their file names. */
export function recordDownloads() {
  const blobs: Blob[] = [];
  const names: string[] = [];
  URL.createObjectURL = vi.fn((blob: Blob) => {
    blobs.push(blob);
    return 'blob:download';
  });
  URL.revokeObjectURL = vi.fn();
  vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
    function (this: HTMLAnchorElement) {
      names.push(this.download);
    },
  );
  return { blobs, names };
}
