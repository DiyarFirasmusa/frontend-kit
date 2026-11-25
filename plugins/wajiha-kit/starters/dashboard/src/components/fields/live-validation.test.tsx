import { useForm } from 'react-hook-form';
import { describe, expect, it } from 'vitest';
import { z } from 'zod';
import { Form } from '@/components/ui/form';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import { tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { formatted } from '@/validations/formats';
import {
  NON_NEGATIVE_MESSAGE,
  WHOLE_NUMBER_MESSAGE,
} from '@/validations/limits';
import { NumberField } from './number-field';
import { TextField } from './text-field';
import { TextareaField } from './textarea-field';

const schema = z.object({
  code: formatted('code', 10),
  grade: formatted('digits', 3),
  phone: formatted('phone', 30),
  days: z
    .number()
    .int({ message: WHOLE_NUMBER_MESSAGE })
    .min(0, { message: NON_NEGATIVE_MESSAGE })
    .max(365, { message: WHOLE_NUMBER_MESSAGE })
    .optional(),
  count: z.string().refine((v) => v === '' || /^\d+$/.test(v), {
    message: WHOLE_NUMBER_MESSAGE,
  }),
  notes: formatted('labelText', 20).optional(),
});

type Values = z.infer<typeof schema>;

function Harness() {
  const form = useForm<Values>({
    resolver: zodResolver(schema),
    defaultValues: {
      code: '',
      grade: '',
      phone: '',
      days: undefined,
      count: '',
      notes: '',
    },
  });
  return (
    <Form {...form}>
      <TextField
        control={form.control}
        name="code"
        label="Code"
        format="code"
        maxLength={10}
      />
      <TextField
        control={form.control}
        name="grade"
        label="Grade"
        format="digits"
        maxLength={3}
      />
      <TextField
        control={form.control}
        name="phone"
        label="Phone"
        format="phone"
        maxLength={30}
      />
      <NumberField
        control={form.control}
        name="days"
        label="Days"
        integer
        min={0}
        max={365}
      />
      <TextField
        control={form.control}
        name="count"
        label="Count"
        type="number"
        integer
        min={0}
      />
      <TextareaField
        control={form.control}
        name="notes"
        label="Notes"
        maxLength={10}
      />
    </Form>
  );
}

describe('wrong input is kept and reported immediately (never silently dropped)', () => {
  it('keeps typed letters in a digits field and shows the format error', async () => {
    const { user } = renderWithProviders(<Harness />);
    const grade = screen.getByLabelText('Grade');

    await user.type(grade, 'hh');

    expect(grade).toHaveValue('hh');
    expect(
      await screen.findByText(tt('common.validation.format.digits')),
    ).toBeInTheDocument();
  });

  it('keeps digits in a letters-only code and shows the format error, then clears it', async () => {
    const { user } = renderWithProviders(<Harness />);
    const code = screen.getByLabelText('Code');

    await user.type(code, '22');
    expect(code).toHaveValue('22');
    expect(
      await screen.findByText(tt('common.validation.format.code')),
    ).toBeInTheDocument();

    await user.clear(code);
    await user.type(code, 'ENG');
    expect(
      screen.queryByText(tt('common.validation.format.code')),
    ).not.toBeInTheDocument();
  });

  it('lets text exceed the limit and reports the maximum length', async () => {
    const { user } = renderWithProviders(<Harness />);
    const code = screen.getByLabelText('Code');

    await user.type(code, 'ABCDEFGHIJK');

    expect(code).toHaveValue('ABCDEFGHIJK');
    expect(
      await screen.findByText(tt('common.validation.maxLength10')),
    ).toBeInTheDocument();
    expect(code).not.toHaveAttribute('maxlength');
  });

  it('reports a bad phone number', async () => {
    const { user } = renderWithProviders(<Harness />);

    await user.type(screen.getByLabelText('Phone'), '0770abc');

    expect(
      await screen.findByText(tt('common.validation.format.phone')),
    ).toBeInTheDocument();
  });

  it('shows an error for a decimal in a whole-number field instead of dropping the dot', async () => {
    const { user } = renderWithProviders(<Harness />);
    const days = screen.getByLabelText('Days');

    await user.type(days, '1.5');

    expect(days).toHaveValue(1.5);
    expect(
      await screen.findByText(tt('common.validation.wholeNumber')),
    ).toBeInTheDocument();
  });

  it('shows an error for a negative number and for a value above the maximum', async () => {
    const { user } = renderWithProviders(<Harness />);
    const days = screen.getByLabelText('Days');

    await user.type(days, '-3');
    expect(days).toHaveValue(-3);
    expect(
      await screen.findByText(tt('common.validation.nonNegative')),
    ).toBeInTheDocument();

    await user.clear(days);
    await user.type(days, '400');
    expect(
      await screen.findByText(tt('common.validation.wholeNumber')),
    ).toBeInTheDocument();
  });

  it('reports a decimal typed into a TextField number input', async () => {
    const { user } = renderWithProviders(<Harness />);
    const count = screen.getByLabelText('Count');

    await user.type(count, '2.5');

    expect(count).toHaveValue(2.5);
    expect(
      await screen.findAllByText(tt('common.validation.wholeNumber')),
    ).not.toHaveLength(0);
  });

  it('validates a textarea against its limit and format as you type', async () => {
    const { user } = renderWithProviders(<Harness />);
    const notes = screen.getByLabelText('Notes');

    await user.type(notes, 'a'.repeat(21));

    expect(notes).toHaveValue('a'.repeat(21));
    expect(
      await screen.findByText(tt('common.validation.maxLength20')),
    ).toBeInTheDocument();
  });

  it('exposes the right on-screen keyboard without restricting input', () => {
    renderWithProviders(<Harness />);

    expect(screen.getByLabelText('Phone')).toHaveAttribute('inputmode', 'tel');
    expect(screen.getByLabelText('Grade')).toHaveAttribute(
      'inputmode',
      'numeric',
    );
    expect(screen.getByLabelText('Count')).toHaveAttribute(
      'inputmode',
      'numeric',
    );
  });
});
