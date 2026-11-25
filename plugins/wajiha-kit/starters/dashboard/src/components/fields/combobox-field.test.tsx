import { useEffect, useState } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, userEvent } from '@/test/render';
import { ComboboxField } from './combobox-field';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

interface Values {
  warehouse: string;
}

interface HarnessProps {
  onSearchChange?: (query: string) => void;
  onValue?: (value: string) => void;
  isLoading?: boolean;
  required?: boolean;
}

function Harness({
  onSearchChange,
  onValue,
  isLoading,
  required,
}: HarnessProps) {
  const form = useForm<Values>({ defaultValues: { warehouse: '' } });
  const [query, setQuery] = useState('');
  useEffect(() => {
    const sub = form.watch((values) => {
      onValue?.(values.warehouse ?? '');
    });
    return () => {
      sub.unsubscribe();
    };
  }, [form, onValue]);
  return (
    <Form {...form}>
      <ComboboxField
        control={form.control}
        name="warehouse"
        label="Warehouse"
        options={OPTIONS}
        placeholder="Pick"
        query={query}
        onQueryChange={setQuery}
        onSearchChange={onSearchChange}
        isLoading={isLoading}
        required={required}
      />
    </Form>
  );
}

describe('ComboboxField', () => {
  it('marks a required field visually and announces it as a description', async () => {
    renderWithProviders(<Harness required />);

    const trigger = screen.getByRole('button', { name: 'Warehouse' });
    expect(trigger).toHaveAccessibleDescription(tt('common.required'));
    expect(
      document.querySelector('[data-slot="required-mark"]'),
    ).toHaveAttribute('aria-hidden', 'true');

    await setTestLanguage('ar');
    expect(trigger).toHaveAccessibleDescription(tt('common.required'));
  });

  it('has no required description when optional', () => {
    renderWithProviders(<Harness />);

    expect(
      screen.getByRole('button', { name: 'Warehouse' }),
    ).not.toHaveAccessibleDescription();
  });

  it('calls onSearchChange with the typed text', async () => {
    const user = userEvent.setup();
    const onSearchChange = vi.fn();
    renderWithProviders(<Harness onSearchChange={onSearchChange} />);

    await user.click(screen.getByRole('button', { name: /Warehouse/i }));
    await user.type(screen.getByPlaceholderText(tt('common.search')), 'Al');

    expect(onSearchChange).toHaveBeenNthCalledWith(1, 'A');
    expect(onSearchChange).toHaveBeenLastCalledWith('Al');
  });

  it('names the options listbox after the field label', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: /Warehouse/i }));
    expect(
      await screen.findByRole('listbox', { name: 'Warehouse' }),
    ).toBeInTheDocument();
  });

  it('shows a loading row while options are loading', async () => {
    const user = userEvent.setup();
    renderWithProviders(<Harness isLoading />);

    await user.click(screen.getByRole('button', { name: /Warehouse/i }));
    expect(await screen.findByText(tt('common.loading'))).toBeInTheDocument();
    expect(
      screen.queryByRole('option', { name: 'Alpha' }),
    ).not.toBeInTheDocument();
  });

  it('writes the selected option into the form field', async () => {
    const user = userEvent.setup();
    const onValue = vi.fn();
    renderWithProviders(<Harness onValue={onValue} />);

    await user.click(screen.getByRole('button', { name: /Warehouse/i }));
    await user.click(await screen.findByRole('option', { name: 'Beta' }));

    expect(onValue).toHaveBeenLastCalledWith('b');
    expect(
      screen.getByRole('button', { name: /Warehouse/i }),
    ).toHaveTextContent('Beta');
  });

  it('shows the loading status in Arabic', async () => {
    await setTestLanguage('ar');
    const user = userEvent.setup();
    renderWithProviders(<Harness isLoading />);

    await user.click(screen.getByRole('button'));
    expect(await screen.findByRole('status')).toHaveTextContent(
      tt('common.loading'),
    );
    await setTestLanguage('en');
  });
});
