import { describe, expect, it } from 'vitest';
import { renderWithProviders, screen } from '@/test/render';
import { ReadOnlyField } from './read-only-field';

describe('ReadOnlyField', () => {
  it('renders the value in a read-only box named by its label', () => {
    renderWithProviders(
      <ReadOnlyField label="Next period" value="July 2026" />,
    );

    const box = screen.getByRole('textbox', { name: 'Next period' });
    expect(box).toHaveTextContent('July 2026');
    expect(box).toHaveAttribute('aria-readonly', 'true');
  });

  it.each([null, undefined, '   '])(
    'renders an em dash for the empty value %s',
    (value) => {
      renderWithProviders(
        <ReadOnlyField label="الفترة التالية" value={value} />,
      );

      expect(
        screen.getByRole('textbox', { name: 'الفترة التالية' }),
      ).toHaveTextContent('—');
    },
  );

  it('announces the lock and keeps code values left-to-right', () => {
    renderWithProviders(
      <ReadOnlyField
        label="الرمز"
        value="BGD-01"
        locked="لا يمكن تغيير الرمز"
        dir="ltr"
        trailing={<span>chevron</span>}
      />,
    );

    expect(screen.getByText('لا يمكن تغيير الرمز')).toHaveClass('sr-only');
    expect(screen.getByText('BGD-01')).toHaveAttribute('dir', 'ltr');
    expect(screen.getByText('chevron')).toBeInTheDocument();
  });

  it('renders node values as given', () => {
    renderWithProviders(
      <ReadOnlyField label="Manager" value={<strong>Ahmed</strong>} />,
    );

    expect(screen.getByRole('textbox', { name: /Manager/ })).toHaveTextContent(
      'Ahmed',
    );
  });
});
