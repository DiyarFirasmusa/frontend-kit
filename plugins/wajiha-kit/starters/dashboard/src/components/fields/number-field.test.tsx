import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { renderWithProviders, screen } from '@/test/render';
import { NumberField } from './number-field';

interface Values {
  places?: number;
}

function Harness({ onValue }: { onValue: (value: unknown) => void }) {
  const form = useForm<Values>({ defaultValues: { places: 3 } });
  return (
    <Form {...form}>
      <NumberField control={form.control} name="places" label="Places" />
      <button
        type="button"
        onClick={() => {
          onValue(form.getValues('places'));
        }}
      >
        read
      </button>
    </Form>
  );
}

describe('NumberField', () => {
  it('stays empty after clearing, so typing replaces the old value', async () => {
    const onValue = vi.fn();
    const { user } = renderWithProviders(<Harness onValue={onValue} />);
    const input = screen.getByLabelText('Places');
    expect(input).toHaveValue(3);

    await user.clear(input);
    expect(input).toHaveValue(null);
    await user.click(screen.getByRole('button', { name: 'read' }));
    expect(onValue.mock.lastCall?.[0]).toBeUndefined();

    await user.type(input, '4');
    expect(input).toHaveValue(4);
    await user.click(screen.getByRole('button', { name: 'read' }));
    expect(onValue).toHaveBeenLastCalledWith(4);
  });
});
