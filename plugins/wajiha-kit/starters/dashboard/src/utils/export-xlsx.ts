export type ExportCell = string | number | boolean | null | undefined;

export interface XlsxSheet {
  name: string;
  headers: string[];
  rows: ExportCell[][];
  /** Right-to-left sheet view (Arabic). */
  rtl?: boolean;
}

const XLSX_MIME =
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet';

const XML_HEAD = '<?xml version="1.0" encoding="UTF-8" standalone="yes"?>\n';
const NS_MAIN = 'http://schemas.openxmlformats.org/spreadsheetml/2006/main';
const NS_REL =
  'http://schemas.openxmlformats.org/officeDocument/2006/relationships';
const NS_PKG_REL =
  'http://schemas.openxmlformats.org/package/2006/relationships';

const SHEET_NAME_FORBIDDEN = /[\\/?*:[\]]/g;
const MAX_CELL_LENGTH = 32_767;
const MAX_COLUMN_WIDTH = 60;
const MIN_COLUMN_WIDTH = 8;

/** Drops the characters XML 1.0 cannot hold (control characters other than tab, LF and CR). */
function stripInvalidXml(value: string): string {
  let out = '';
  for (const char of value) {
    const code = char.codePointAt(0) ?? 0;
    const isControl =
      code < 0x20 && code !== 0x09 && code !== 0x0a && code !== 0x0d;
    if (!isControl && code !== 0xff_fe && code !== 0xff_ff) {
      out += char;
    }
  }
  return out;
}

function escapeXml(value: string): string {
  return stripInvalidXml(value)
    .replaceAll('&', '&amp;')
    .replaceAll('<', '&lt;')
    .replaceAll('>', '&gt;')
    .replaceAll('"', '&quot;');
}

/** Column letters for a zero-based index: 0 → A, 25 → Z, 26 → AA. */
export function columnName(index: number): string {
  let name = '';
  let n = index + 1;
  while (n > 0) {
    const rem = (n - 1) % 26;
    name = String.fromCodePoint(65 + rem) + name;
    n = Math.floor((n - 1) / 26);
  }
  return name;
}

/** Excel sheet names: ≤ 31 chars, none of \ / ? * : [ ], unique. */
function safeSheetName(name: string, used: Set<string>): string {
  const base =
    name.replaceAll(SHEET_NAME_FORBIDDEN, ' ').trim().slice(0, 31) || 'Sheet';
  let candidate = base;
  let n = 2;
  while (used.has(candidate.toLowerCase())) {
    const suffix = ` (${n})`;
    candidate = base.slice(0, 31 - suffix.length) + suffix;
    n += 1;
  }
  used.add(candidate.toLowerCase());
  return candidate;
}

function cellXml(ref: string, value: ExportCell, style: number): string {
  const s = style > 0 ? ` s="${style}"` : '';
  if (value === null || value === undefined || value === '') {
    return style > 0 ? `<c r="${ref}"${s}/>` : '';
  }
  if (typeof value === 'number') {
    return Number.isFinite(value)
      ? `<c r="${ref}"${s}><v>${value}</v></c>`
      : '';
  }
  if (typeof value === 'boolean') {
    return `<c r="${ref}"${s} t="b"><v>${value ? 1 : 0}</v></c>`;
  }
  const text = escapeXml(value.slice(0, MAX_CELL_LENGTH));
  return `<c r="${ref}"${s} t="inlineStr"><is><t xml:space="preserve">${text}</t></is></c>`;
}

function cellWidth(value: ExportCell): number {
  if (value === null || value === undefined) {
    return 0;
  }
  return String(value).length;
}

function sheetXml(sheet: XlsxSheet): string {
  const widths = sheet.headers.map((header) => cellWidth(header));
  const sample = sheet.rows.slice(0, 500);
  for (const row of sample) {
    row.forEach((value, index) => {
      widths[index] = Math.max(widths[index] ?? 0, cellWidth(value));
    });
  }
  const cols = widths
    .map((width, index) => {
      const w = Math.min(
        MAX_COLUMN_WIDTH,
        Math.max(MIN_COLUMN_WIDTH, width + 2),
      );
      return `<col min="${index + 1}" max="${index + 1}" width="${w}" customWidth="1"/>`;
    })
    .join('');

  const lines: string[] = [];
  const header = sheet.headers
    .map((value, index) => cellXml(`${columnName(index)}1`, value, 1))
    .join('');
  lines.push(`<row r="1">${header}</row>`);
  sheet.rows.forEach((row, rowIndex) => {
    const r = rowIndex + 2;
    const cells = row
      .map((value, index) => cellXml(`${columnName(index)}${r}`, value, 0))
      .join('');
    lines.push(`<row r="${r}">${cells}</row>`);
  });

  const lastColumn = columnName(Math.max(sheet.headers.length - 1, 0));
  const lastRow = sheet.rows.length + 1;
  const rtl = sheet.rtl ? ' rightToLeft="1"' : '';
  const filter =
    sheet.headers.length > 0
      ? `<autoFilter ref="A1:${lastColumn}${lastRow}"/>`
      : '';

  return (
    `${XML_HEAD}<worksheet xmlns="${NS_MAIN}" xmlns:r="${NS_REL}">` +
    `<sheetViews><sheetView workbookViewId="0"${rtl}>` +
    '<pane ySplit="1" topLeftCell="A2" activePane="bottomLeft" state="frozen"/>' +
    '</sheetView></sheetViews>' +
    `<cols>${cols}</cols>` +
    `<sheetData>${lines.join('')}</sheetData>${filter}</worksheet>`
  );
}

function workbookXml(names: string[]): string {
  const sheets = names
    .map(
      (name, index) =>
        `<sheet name="${escapeXml(name)}" sheetId="${index + 1}" r:id="rId${index + 1}"/>`,
    )
    .join('');
  return `${XML_HEAD}<workbook xmlns="${NS_MAIN}" xmlns:r="${NS_REL}"><sheets>${sheets}</sheets></workbook>`;
}

function workbookRelsXml(count: number): string {
  const sheets = Array.from(
    { length: count },
    (_, index) =>
      `<Relationship Id="rId${index + 1}" Type="${NS_REL}/worksheet" Target="worksheets/sheet${index + 1}.xml"/>`,
  ).join('');
  const styles = `<Relationship Id="rId${count + 1}" Type="${NS_REL}/styles" Target="styles.xml"/>`;
  return `${XML_HEAD}<Relationships xmlns="${NS_PKG_REL}">${sheets}${styles}</Relationships>`;
}

function contentTypesXml(count: number): string {
  const sheets = Array.from(
    { length: count },
    (_, index) =>
      `<Override PartName="/xl/worksheets/sheet${index + 1}.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.worksheet+xml"/>`,
  ).join('');
  return (
    `${XML_HEAD}<Types xmlns="http://schemas.openxmlformats.org/package/2006/content-types">` +
    '<Default Extension="rels" ContentType="application/vnd.openxmlformats-package.relationships+xml"/>' +
    '<Default Extension="xml" ContentType="application/xml"/>' +
    '<Override PartName="/xl/workbook.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.sheet.main+xml"/>' +
    '<Override PartName="/xl/styles.xml" ContentType="application/vnd.openxmlformats-officedocument.spreadsheetml.styles+xml"/>' +
    `${sheets}</Types>`
  );
}

const ROOT_RELS = `${XML_HEAD}<Relationships xmlns="${NS_PKG_REL}"><Relationship Id="rId1" Type="${NS_REL}/officeDocument" Target="xl/workbook.xml"/></Relationships>`;

/** Style 1 = bold header on a light fill. */
const STYLES =
  `${XML_HEAD}<styleSheet xmlns="${NS_MAIN}">` +
  '<fonts count="2"><font><sz val="11"/><name val="Calibri"/></font><font><b/><sz val="11"/><name val="Calibri"/></font></fonts>' +
  '<fills count="3"><fill><patternFill patternType="none"/></fill><fill><patternFill patternType="gray125"/></fill>' +
  '<fill><patternFill patternType="solid"><fgColor rgb="FFEFECED"/><bgColor indexed="64"/></patternFill></fill></fills>' +
  '<borders count="1"><border><left/><right/><top/><bottom/><diagonal/></border></borders>' +
  '<cellStyleXfs count="1"><xf numFmtId="0" fontId="0" fillId="0" borderId="0"/></cellStyleXfs>' +
  '<cellXfs count="2"><xf numFmtId="0" fontId="0" fillId="0" borderId="0" xfId="0"/>' +
  '<xf numFmtId="0" fontId="1" fillId="2" borderId="0" xfId="0" applyFont="1" applyFill="1"/></cellXfs>' +
  '<cellStyles count="1"><cellStyle name="Normal" xfId="0" builtinId="0"/></cellStyles>' +
  '</styleSheet>';

let crcTable: Uint32Array | null = null;

function crc32(data: Uint8Array): number {
  if (!crcTable) {
    crcTable = new Uint32Array(256);
    for (let n = 0; n < 256; n += 1) {
      let c = n;
      for (let k = 0; k < 8; k += 1) {
        c = c & 1 ? 0xed_b8_83_20 ^ (c >>> 1) : c >>> 1;
      }
      crcTable[n] = c;
    }
  }
  let crc = 0xff_ff_ff_ff;
  for (const byte of data) {
    crc = (crcTable[(crc ^ byte) & 0xff] ?? 0) ^ (crc >>> 8);
  }
  return crc ^ 0xff_ff_ff_ff;
}

async function deflateRaw(data: Uint8Array): Promise<Uint8Array | null> {
  if (typeof CompressionStream === 'undefined') {
    return null;
  }
  try {
    const stream = new Blob([data as BlobPart])
      .stream()
      .pipeThrough(new CompressionStream('deflate-raw'));
    return new Uint8Array(await new Response(stream).arrayBuffer());
  } catch {
    return null;
  }
}

interface ZipEntry {
  name: Uint8Array;
  data: Uint8Array;
  crc: number;
  size: number;
  method: 0 | 8;
  offset: number;
}

/** A ZIP archive (deflated when the browser supports it, stored otherwise). */
export async function buildZip(
  files: { path: string; content: string }[],
): Promise<Blob> {
  const encoder = new TextEncoder();
  const entries: ZipEntry[] = [];
  const parts: Uint8Array[] = [];
  let offset = 0;

  for (const file of files) {
    const raw = encoder.encode(file.content);
    const compressed = await deflateRaw(raw);
    const data = compressed ?? raw;
    const entry: ZipEntry = {
      name: encoder.encode(file.path),
      data,
      crc: crc32(raw),
      size: raw.length,
      method: compressed ? 8 : 0,
      offset,
    };
    const header = new Uint8Array(30 + entry.name.length);
    const view = new DataView(header.buffer);
    view.setUint32(0, 0x04_03_4b_50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 0x08_00, true);
    view.setUint16(8, entry.method, true);
    view.setUint16(10, 0, true);
    view.setUint16(12, 0x21, true);
    view.setUint32(14, entry.crc, true);
    view.setUint32(18, data.length, true);
    view.setUint32(22, entry.size, true);
    view.setUint16(26, entry.name.length, true);
    view.setUint16(28, 0, true);
    header.set(entry.name, 30);
    parts.push(header, data);
    offset += header.length + data.length;
    entries.push(entry);
  }

  const centralStart = offset;
  for (const entry of entries) {
    const record = new Uint8Array(46 + entry.name.length);
    const view = new DataView(record.buffer);
    view.setUint32(0, 0x02_01_4b_50, true);
    view.setUint16(4, 20, true);
    view.setUint16(6, 20, true);
    view.setUint16(8, 0x08_00, true);
    view.setUint16(10, entry.method, true);
    view.setUint16(12, 0, true);
    view.setUint16(14, 0x21, true);
    view.setUint32(16, entry.crc, true);
    view.setUint32(20, entry.data.length, true);
    view.setUint32(24, entry.size, true);
    view.setUint16(28, entry.name.length, true);
    view.setUint32(42, entry.offset, true);
    record.set(entry.name, 46);
    parts.push(record);
    offset += record.length;
  }

  const end = new Uint8Array(22);
  const endView = new DataView(end.buffer);
  endView.setUint32(0, 0x06_05_4b_50, true);
  endView.setUint16(8, entries.length, true);
  endView.setUint16(10, entries.length, true);
  endView.setUint32(12, offset - centralStart, true);
  endView.setUint32(16, centralStart, true);
  parts.push(end);

  return new Blob(parts as BlobPart[], { type: 'application/zip' });
}

/** The XML parts of an .xlsx workbook, path → content. */
export function buildXlsxParts(
  sheets: XlsxSheet[],
): { path: string; content: string }[] {
  const used = new Set<string>();
  const list =
    sheets.length > 0 ? sheets : [{ name: 'Sheet', headers: [], rows: [] }];
  const names = list.map((sheet) => safeSheetName(sheet.name, used));
  return [
    { path: '[Content_Types].xml', content: contentTypesXml(list.length) },
    { path: '_rels/.rels', content: ROOT_RELS },
    { path: 'xl/workbook.xml', content: workbookXml(names) },
    {
      path: 'xl/_rels/workbook.xml.rels',
      content: workbookRelsXml(list.length),
    },
    { path: 'xl/styles.xml', content: STYLES },
    ...list.map((sheet, index) => ({
      path: `xl/worksheets/sheet${index + 1}.xml`,
      content: sheetXml(sheet),
    })),
  ];
}

/** An Excel (.xlsx) workbook. Text cells are stored as text, never as formulas. */
export async function buildXlsx(sheets: XlsxSheet[]): Promise<Blob> {
  const zip = await buildZip(buildXlsxParts(sheets));
  return new Blob([zip], { type: XLSX_MIME });
}

/** `name` with the .xlsx extension. */
export function xlsxFileName(name: string): string {
  return name.toLowerCase().endsWith('.xlsx') ? name : `${name}.xlsx`;
}
