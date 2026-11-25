import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { SelectField } from './select-field';

const OPTIONS = [
  { value: 'a', label: 'Alpha' },
  { value: 'b', label: 'Beta' },
];

interface Values {
  warehouse: string;
}

interface HarnessProps {
  initial?: string;
  required?: boolean;
  disabled?: boolean;
  clearable?: boolean;
  onSubmit?: (values: Values) => void;
}

function Harness({
  initial = 'a',
  required,
  disabled,
  clearable,
  onSubmit = () => {},
}: HarnessProps) {
  const form = useForm<Values>({ defaultValues: { warehouse: initial } });
  return (
    <Form {...form}>
      <form onSubmit={form.handleSubmit(onSubmit)}>
        <SelectField
          control={form.control}
          name="warehouse"
          label="Warehouse"
          options={OPTIONS}
          placeholder="Pick a warehouse"
          required={required}
          disabled={disabled}
          clearable={clearable}
        />
        <button type="submit">Save</button>
      </form>
    </Form>
  );
}

const clearButton = () =>
  screen.queryByRole('button', { name: tt('common.clearValue') });

describe('SelectField clear button', () => {
  it('empties an optional field without opening the popup', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<Harness onSubmit={onSubmit} />);
    const trigger = screen.getByRole('combobox', { name: 'Warehouse' });
    expect(trigger).toHaveTextContent('Alpha');

    await user.click(clearButton() as HTMLElement);

    expect(trigger).toHaveTextContent('Pick a warehouse');
    expect(trigger).toHaveAttribute('aria-expanded', 'false');
    expect(screen.queryByRole('listbox')).not.toBeInTheDocument();
    expect(clearButton()).not.toBeInTheDocument();
    expect(trigger).toHaveFocus();

    await user.click(screen.getByRole('button', { name: 'Save' }));
    expect(onSubmit).toHaveBeenCalledWith({ warehouse: '' }, expect.anything());
  });

  it('is hidden on a required field', () => {
    renderWithProviders(<Harness required />);
    expect(clearButton()).not.toBeInTheDocument();
  });

  it('is hidden while the field is empty', () => {
    renderWithProviders(<Harness initial="" />);
    expect(clearButton()).not.toBeInTheDocument();
  });

  it('is hidden on a disabled field', () => {
    renderWithProviders(<Harness disabled />);
    expect(clearButton()).not.toBeInTheDocument();
  });

  it('is hidden when the caller opts out', () => {
    renderWithProviders(<Harness clearable={false} />);
    expect(clearButton()).not.toBeInTheDocument();
  });
});
