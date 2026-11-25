import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import i18n from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import type { AssignmentRow } from '../types/types';
import { getCategoryAssignmentColumns } from './category-assignment-columns';

function makeRow(overrides: Partial<AssignmentRow> = {}): AssignmentRow {
  return {
    id: 'asg-2',
    sourceCategoryId: 'cat-hand',
    sourceCategoryName: null,
    unitLabel: null,
    options: null,
    inherited: false,
    attributeDefinitionId: 'attr-color',
    attributeCode: 'COLOR',
    attributeName: 'اللون',
    dataType: 'OPTION',
    isRequired: false,
    isVariantAxis: true,
    sortOrder: 2,
    sourceName: 'حماية اليدين',
    ...overrides,
  };
}

function build(
  overrides: Partial<Parameters<typeof getCategoryAssignmentColumns>[0]> = {},
) {
  return getCategoryAssignmentColumns({
    t: i18n.t,
    canWrite: true,
    onToggleRequired: vi.fn(),
    onToggleVariantAxis: vi.fn(),
    onEditOptions: vi.fn(),
    onDetach: vi.fn(),
    ...overrides,
  });
}

function byId(columns: ReturnType<typeof build>) {
  return Object.fromEntries(columns.map((c) => [c.id, c]));
}

describe('getCategoryAssignmentColumns', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('defines the columns in display order', () => {
    expect(build().map((c) => c.id)).toEqual([
      'attribute',
      'dataType',
      'source',
      'required',
      'variantAxis',
      'options',
      'actions',
    ]);
  });

  it('shows the inherited read-only label and disables switches for inherited rows', () => {
    const cols = byId(build());
    const row = makeRow({
      inherited: true,
      isRequired: true,
      dataType: 'TEXT',
    });
    const { unmount } = renderWithProviders(
      <>
        {cols.attribute?.cell?.(row)}
        {cols.required?.cell?.(row)}
        {cols.variantAxis?.cell?.(row)}
      </>,
    );
    expect(
      screen.getByText(tt('categories.assignments.inheritedReadonly')),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('switch', {
        name: tt('categories.assignments.col.required'),
      }),
    ).toHaveAttribute('aria-disabled', 'true');
    expect(
      screen.getByRole('switch', {
        name: tt('categories.assignments.col.variantAxis'),
      }),
    ).toHaveAttribute('aria-disabled', 'true');
    unmount();
  });

  it('renders no detach button for inherited rows', () => {
    const cols = byId(build());
    const { unmount } = renderWithProviders(
      <>{cols.actions?.cell?.(makeRow({ inherited: true }))}</>,
    );
    expect(
      screen.queryByRole('button', {
        name: tt('categories.assignments.detach'),
      }),
    ).not.toBeInTheDocument();
    unmount();
  });

  it('calls onDetach for an own row when the detach button is clicked', async () => {
    const onDetach = vi.fn();
    const cols = byId(build({ onDetach }));
    const row = makeRow();
    const { user, unmount } = renderWithProviders(
      <>{cols.actions?.cell?.(row)}</>,
    );
    await user.click(
      screen.getByRole('button', { name: tt('categories.assignments.detach') }),
    );
    expect(onDetach).toHaveBeenCalledWith(row);
    unmount();
  });

  it('calls onToggleRequired with the new value for an own row', async () => {
    const onToggleRequired = vi.fn();
    const cols = byId(build({ onToggleRequired }));
    const row = makeRow({ isRequired: false });
    const { user, unmount } = renderWithProviders(
      <>{cols.required?.cell?.(row)}</>,
    );
    await user.click(
      screen.getByRole('switch', {
        name: tt('categories.assignments.col.required'),
      }),
    );
    expect(onToggleRequired).toHaveBeenCalledWith(row, true);
    unmount();
  });

  it('shows the options button only for OPTION attributes when writable', () => {
    const cols = byId(build());
    const { rerender } = renderWithProviders(
      <>{cols.options?.cell?.(makeRow({ dataType: 'OPTION' }))}</>,
    );
    expect(
      screen.getByRole('button', {
        name: tt('categories.assignments.editOptions'),
      }),
    ).toBeInTheDocument();

    rerender(<>{cols.options?.cell?.(makeRow({ dataType: 'TEXT' }))}</>);
    expect(
      screen.queryByRole('button', {
        name: tt('categories.assignments.editOptions'),
      }),
    ).not.toBeInTheDocument();
    expect(screen.getByText('—')).toBeInTheDocument();
  });

  it('renders an em dash for a missing data type and attribute name', () => {
    const cols = byId(build());
    const row = makeRow({ dataType: null, attributeName: null });
    renderWithProviders(
      <>
        {cols.attribute?.cell?.(row)}
        {cols.dataType?.cell?.(row)}
      </>,
    );
    expect(screen.getAllByText('—')).toHaveLength(2);
  });

  it('uses English headers and switches to Arabic headers', async () => {
    expect(byId(build()).attribute?.header).toBe('Attribute');
    expect(byId(build()).source?.header).toBe('Source');

    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    expect(byId(build()).attribute?.header).toBe('الخاصية');
    expect(byId(build()).source?.header).toBe('المصدر');
  });
});
