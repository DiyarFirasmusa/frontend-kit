import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import i18n from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import { activeBadge } from '@/utils/status-tones';
import { getAttributeDefinitionColumns } from './attribute-definition-columns';

function makeAttribute(
  overrides: Partial<AttributeDefinitionResponse> = {},
): AttributeDefinitionResponse {
  return {
    id: 'attr-color',
    code: 'COLOR',
    name: 'اللون',
    dataType: 'OPTION',
    unitLabel: null,
    isActive: true,
    options: [
      { id: 'o-1', code: 'black', label: 'أسود', sortOrder: 1, isActive: true },
      { id: 'o-2', code: 'blue', label: 'أزرق', sortOrder: 2, isActive: true },
      { id: 'o-3', code: 'grey', label: 'رمادي', sortOrder: 3, isActive: true },
    ],
    ...overrides,
  };
}

function byId() {
  const columns = getAttributeDefinitionColumns({
    t: i18n.t,
    canWrite: false,
    canDelete: false,
    onEdit: vi.fn(),
    onEditOptions: vi.fn(),
    onDelete: vi.fn(),
  });
  return Object.fromEntries(columns.map((c) => [c.id, c]));
}

describe('getAttributeDefinitionColumns', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('renders the active status badge for an active attribute', () => {
    const cols = byId();
    const badge = activeBadge(true);
    renderWithProviders(
      <>{cols.status?.cell?.(makeAttribute({ isActive: true }))}</>,
    );
    expect(screen.getByText(tt(badge.labelKey))).toBeInTheDocument();
  });

  it('renders the inactive status badge for an inactive attribute', () => {
    const cols = byId();
    const badge = activeBadge(false);
    renderWithProviders(
      <>{cols.status?.cell?.(makeAttribute({ isActive: false }))}</>,
    );
    expect(screen.getByText(tt(badge.labelKey))).toBeInTheDocument();
  });

  it('renders an em dash when the unit label is null', () => {
    const cols = byId();
    const row = makeAttribute({ unitLabel: null });
    expect(cols.unit?.accessor?.(row)).toBe('—');
  });

  it('renders the unit label when present', () => {
    const cols = byId();
    const row = makeAttribute({
      dataType: 'NUMBER',
      unitLabel: 'kg',
      options: null,
    });
    renderWithProviders(<>{cols.unit?.accessor?.(row)}</>);
    expect(screen.getByText('kg')).toBeInTheDocument();
  });

  it('counts the options for an OPTION attribute', () => {
    const cols = byId();
    renderWithProviders(
      <>{cols.options?.cell?.(makeAttribute({ dataType: 'OPTION' }))}</>,
    );
    expect(screen.getByText('3')).toBeInTheDocument();
  });

  it('renders an em dash for options on a non-OPTION attribute', () => {
    const cols = byId();
    renderWithProviders(
      <>
        {cols.options?.cell?.(
          makeAttribute({ dataType: 'TEXT', options: null }),
        )}
      </>,
    );
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('shows the English and Arabic data type labels', async () => {
    const { rerender } = renderWithProviders(
      <>{byId().dataType?.cell?.(makeAttribute({ dataType: 'NUMBER' }))}</>,
    );
    expect(
      screen.getByText(tt('enums.AttributeDataType.NUMBER')),
    ).toBeInTheDocument();

    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    rerender(
      <>{byId().dataType?.cell?.(makeAttribute({ dataType: 'BOOLEAN' }))}</>,
    );
    expect(
      screen.getByText(tt('enums.AttributeDataType.BOOLEAN')),
    ).toBeInTheDocument();
  });
});
