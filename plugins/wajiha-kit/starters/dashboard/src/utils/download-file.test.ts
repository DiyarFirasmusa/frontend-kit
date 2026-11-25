import { afterEach, describe, expect, it, vi } from 'vitest';
import { parseContentDispositionFilename, saveBlob } from './download-file';

describe('parseContentDispositionFilename', () => {
  it('reads a quoted filename', () => {
    expect(
      parseContentDispositionFilename(
        'attachment; filename="stock-balances.csv"',
        'x.csv',
      ),
    ).toBe('stock-balances.csv');
  });

  it('reads an unquoted filename', () => {
    expect(
      parseContentDispositionFilename('attachment; filename=a.csv', 'x.csv'),
    ).toBe('a.csv');
  });

  it('prefers the UTF-8 form and decodes it', () => {
    expect(
      parseContentDispositionFilename(
        `attachment; filename="a.csv"; filename*=UTF-8''%D9%85%D8%AE%D8%B2%D9%88%D9%86.csv`,
        'x.csv',
      ),
    ).toBe('مخزون.csv');
  });

  it('falls back when the header is missing or has no name', () => {
    expect(parseContentDispositionFilename(undefined, 'x.csv')).toBe('x.csv');
    expect(parseContentDispositionFilename('attachment', 'x.csv')).toBe(
      'x.csv',
    );
  });
});

describe('saveBlob', () => {
  afterEach(() => {
    vi.restoreAllMocks();
  });

  it('clicks an anchor with the file name and revokes the url', () => {
    URL.createObjectURL = vi.fn(() => 'blob:file');
    URL.revokeObjectURL = vi.fn();
    const names: string[] = [];
    vi.spyOn(HTMLAnchorElement.prototype, 'click').mockImplementation(
      function (this: HTMLAnchorElement) {
        names.push(this.download);
      },
    );
    saveBlob(new Blob(['a']), 'rows.csv');
    expect(names).toEqual(['rows.csv']);
    expect(URL.revokeObjectURL).toHaveBeenCalledWith('blob:file');
  });
});
