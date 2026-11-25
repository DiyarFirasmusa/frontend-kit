import { describe, expect, it } from 'vitest';
import { readXlsxRows, readXlsxSheetNames, unzipText } from '@/test/xlsx';
import {
  buildXlsx,
  buildXlsxParts,
  columnName,
  xlsxFileName,
} from './export-xlsx';

describe('columnName', () => {
  it('maps indexes to spreadsheet letters', () => {
    expect(columnName(0)).toBe('A');
    expect(columnName(25)).toBe('Z');
    expect(columnName(26)).toBe('AA');
    expect(columnName(701)).toBe('ZZ');
    expect(columnName(702)).toBe('AAA');
  });
});

describe('xlsxFileName', () => {
  it('adds the extension once', () => {
    expect(xlsxFileName('items-2026-11-19')).toBe('items-2026-11-19.xlsx');
    expect(xlsxFileName('items.XLSX')).toBe('items.XLSX');
  });
});

describe('buildXlsx', () => {
  it('writes an Excel workbook with the headers and rows', async () => {
    const blob = await buildXlsx([
      {
        name: 'Items',
        headers: ['Code', 'Qty', 'Active'],
        rows: [
          ['ITM-1', 12.5, true],
          ['ITM-2', null, false],
        ],
      },
    ]);

    expect(blob.type).toBe(
      'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    );
    expect(await readXlsxRows(blob)).toEqual([
      ['Code', 'Qty', 'Active'],
      ['ITM-1', '12.5', '1'],
      ['ITM-2', '', '0'],
    ]);
  });

  it('keeps text that looks like a formula as text, escaped', async () => {
    const blob = await buildXlsx([
      { name: 'S', headers: ['A'], rows: [['=SUM(A1)'], ['a & <b> "c"']] },
    ]);
    const xml = (await unzipText(blob)).get('xl/worksheets/sheet1.xml') ?? '';

    expect(xml).not.toContain('<f>');
    expect(xml).toContain('t="inlineStr"');
    expect(xml).toContain('a &amp; &lt;b&gt; &quot;c&quot;');
    expect(await readXlsxRows(blob)).toEqual([
      ['A'],
      ['=SUM(A1)'],
      ['a & <b> "c"'],
    ]);
  });

  it('writes numbers as numeric cells and drops non-finite ones', () => {
    const parts = buildXlsxParts([
      { name: 'S', headers: ['N'], rows: [[-3], [Number.NaN]] },
    ]);
    const sheet = parts.find((part) => part.path.endsWith('sheet1.xml'));

    expect(sheet?.content).toContain('<c r="A2"><v>-3</v></c>');
    expect(sheet?.content).toContain('<row r="3"></row>');
  });

  it('sets a right-to-left view, a frozen header and a filter', () => {
    const sheet = buildXlsxParts([
      { name: 'S', headers: ['A', 'B'], rows: [[1, 2]], rtl: true },
    ]).find((part) => part.path.endsWith('sheet1.xml'));

    expect(sheet?.content).toContain('rightToLeft="1"');
    expect(sheet?.content).toContain('state="frozen"');
    expect(sheet?.content).toContain('<autoFilter ref="A1:B2"/>');
  });

  it('cleans and de-duplicates sheet names', async () => {
    const blob = await buildXlsx([
      { name: 'a/b?', headers: [], rows: [] },
      { name: 'A/B?', headers: [], rows: [] },
      { name: 'x'.repeat(40), headers: [], rows: [] },
    ]);

    expect(await readXlsxSheetNames(blob)).toEqual([
      'a b',
      'A B (2)',
      'x'.repeat(31),
    ]);
  });

  it('drops control characters XML cannot hold', async () => {
    const blob = await buildXlsx([
      { name: 'S', headers: ['A'], rows: [['a\u0001b\tc']] },
    ]);

    expect(await readXlsxRows(blob)).toEqual([['A'], ['ab\tc']]);
  });

  it('writes Arabic text unchanged', async () => {
    const blob = await buildXlsx([
      { name: 'مستندات', headers: ['الرقم'], rows: [['استلام']] },
    ]);

    expect(await readXlsxSheetNames(blob)).toEqual(['مستندات']);
    expect(await readXlsxRows(blob)).toEqual([['الرقم'], ['استلام']]);
  });
});
