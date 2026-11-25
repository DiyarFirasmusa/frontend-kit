import { describe, expect, it, vi } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { ExportExcelButton } from './export-excel-button';

describe('ExportExcelButton', () => {
  it('calls onExport when clicked', async () => {
    const onExport = vi.fn();
    const { user } = renderWithProviders(
      <ExportExcelButton onExport={onExport} />,
    );

    await user.click(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    );

    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('is busy and disabled while exporting', () => {
    renderWithProviders(<ExportExcelButton onExport={vi.fn()} isExporting />);

    const button = screen.getByRole('button', { name: tt('common.exporting') });
    expect(button).toBeDisabled();
    expect(button).toHaveAttribute('aria-busy', 'true');
  });

  it('can be disabled and take a custom label', () => {
    renderWithProviders(
      <ExportExcelButton onExport={vi.fn()} disabled label="Export report" />,
    );

    expect(
      screen.getByRole('button', { name: 'Export report' }),
    ).toBeDisabled();
  });

  it('is labelled in Arabic', async () => {
    await setTestLanguage('ar');
    renderWithProviders(<ExportExcelButton onExport={vi.fn()} />);

    expect(screen.getByRole('button', { name: 'تصدير Excel' })).toBeEnabled();
  });

  it('offers the current page and all data when it can export a page', async () => {
    const onExport = vi.fn();
    const onExportPage = vi.fn();
    const { user } = renderWithProviders(
      <ExportExcelButton onExport={onExport} onExportPage={onExportPage} />,
    );

    await user.click(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    );
    await user.click(
      await screen.findByRole('menuitem', {
        name: tt('common.exportCurrentPage'),
      }),
    );
    expect(onExportPage).toHaveBeenCalledTimes(1);
    expect(onExport).not.toHaveBeenCalled();

    await user.click(
      screen.getByRole('button', { name: tt('common.exportExcel') }),
    );
    await user.click(
      await screen.findByRole('menuitem', { name: tt('common.exportAllRows') }),
    );
    expect(onExport).toHaveBeenCalledTimes(1);
  });

  it('labels the menu choices in Arabic', async () => {
    await setTestLanguage('ar');
    const { user } = renderWithProviders(
      <ExportExcelButton onExport={vi.fn()} onExportPage={vi.fn()} />,
    );

    await user.click(screen.getByRole('button', { name: 'تصدير Excel' }));

    expect(
      await screen.findByRole('menuitem', { name: 'الصفحة الحالية' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('menuitem', { name: 'كل البيانات' }),
    ).toBeInTheDocument();
  });

  it('keeps the menu closed while exporting', () => {
    renderWithProviders(
      <ExportExcelButton
        onExport={vi.fn()}
        onExportPage={vi.fn()}
        isExporting
      />,
    );

    expect(
      screen.getByRole('button', { name: tt('common.exporting') }),
    ).toBeDisabled();
  });
});
