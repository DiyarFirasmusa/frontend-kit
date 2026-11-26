import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it } from 'vitest';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { Form, FormControl, FormField, FormItem, FormLabel, FormMessage } from './form';
import { Input } from './input';

interface Values {
  name: string;
}

function Harness({ message }: { message: string }) {
  const form = useForm<Values>({ defaultValues: { name: '' } });
  return (
    <Form {...form}>
      <form>
        <FormField
          control={form.control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel>Name</FormLabel>
              <FormControl>
                <Input {...field} />
              </FormControl>
              <FormMessage />
              <button
                type="button"
                onClick={() => {
                  form.setError('name', { message });
                }}
              >
                Trigger
              </button>
            </FormItem>
          )}
        />
      </form>
    </Form>
  );
}

afterEach(async () => {
  await setTestLanguage('en');
});

describe('FormMessage', () => {
  it('translates an i18n key in English', async () => {
    const { user } = renderWithProviders(<Harness message="ui.active" />);
    await user.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(await screen.findByText(tt('ui.active'))).toBeInTheDocument();
  });

  it('translates an i18n key in Arabic', async () => {
    await setTestLanguage('ar');
    const { user } = renderWithProviders(<Harness message="ui.active" />);
    await user.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(await screen.findByText(tt('ui.active'))).toBeInTheDocument();
    expect(tt('ui.active')).not.toBe('ui.active');
  });

  it('renders the raw string when no translation key exists', async () => {
    const { user } = renderWithProviders(<Harness message="This field is required" />);
    await user.click(screen.getByRole('button', { name: 'Trigger' }));
    expect(await screen.findByText('This field is required')).toBeInTheDocument();
  });
});
