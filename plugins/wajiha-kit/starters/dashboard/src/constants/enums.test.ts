import { describe, expect, it } from 'vitest';
import { enumLabelKey } from './enums';

describe('enumLabelKey', () => {
  it('builds the i18n key for a backend enum value', () => {
    expect(enumLabelKey('AttributeDataType', 'TEXT')).toBe(
      'enums.AttributeDataType.TEXT',
    );
  });
});
