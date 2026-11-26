import { describe, expect, it } from 'vitest';
import { setTestLanguage } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { Sheet, SheetContent, SheetDescription, SheetHeader, SheetTitle } from './sheet';

describe('Sheet', () => {
  it('renders the side panel as a labelled dialog with its side marker', () => {
    renderWithProviders(
      <Sheet open>
        <SheetContent side="left">
          <SheetHeader>
            <SheetTitle>Main navigation</SheetTitle>
            <SheetDescription>Mobile sidebar</SheetDescription>
          </SheetHeader>
        </SheetContent>
      </Sheet>,
    );
    const panel = screen.getByRole('dialog', { name: 'Main navigation' });
    expect(panel).toHaveAttribute('data-side', 'inline-start');
    expect(screen.getByText('Mobile sidebar')).toBeInTheDocument();
  });

  it('renders the close button by default', () => {
    renderWithProviders(
      <Sheet open>
        <SheetContent>
          <SheetTitle>Panel</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('button', { name: 'Close' })).toBeInTheDocument();
  });

  it('resolves physical right to the start edge in Arabic (RTL)', async () => {
    await setTestLanguage('ar');
    renderWithProviders(
      <Sheet open>
        <SheetContent side="right">
          <SheetTitle>Panel</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'inline-start');
  });

  it('resolves physical left to the end edge in Arabic (RTL)', async () => {
    await setTestLanguage('ar');
    renderWithProviders(
      <Sheet open>
        <SheetContent side="left">
          <SheetTitle>Panel</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'inline-end');
  });

  it('resolves physical right to the end edge in English (LTR)', () => {
    renderWithProviders(
      <Sheet open>
        <SheetContent side="right">
          <SheetTitle>Panel</SheetTitle>
        </SheetContent>
      </Sheet>,
    );
    expect(screen.getByRole('dialog')).toHaveAttribute('data-side', 'inline-end');
  });
});
