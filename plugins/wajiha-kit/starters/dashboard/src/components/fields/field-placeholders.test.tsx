import { useForm } from 'react-hook-form';
import { afterEach, describe, expect, it, vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import { ComboboxField } from './combobox-field';
import { NumberField } from './number-field';
import { PersonSelectField } from './person-select-field';
import { SelectControl } from './select-control';
import { SelectField } from './select-field';
import { TextField } from './text-field';
import { TextareaField } from './textarea-field';

interface Values {
  code: string;
  note: string;
  qty?: number;
  date: string;
  time: string;
  pick: string;
  combo: string;
  person: string;
}

const OPTIONS = [{ value: 'a', label: 'Alpha' }];

function Harness({ withPlaceholders }: { withPlaceholders: boolean }) {
  const form = useForm<Values>({
    defaultValues: {
      code: '',
      note: '',
      date: '',
      time: '',
      pick: '',
      combo: '',
      person: '',
    },
  });
  const hint = (text: string) => (withPlaceholders ? text : undefined);
  return (
    <Form {...form}>
      <TextField
        control={form.control}
        name="code"
        placeholder={hint('Code')}
      />
      <TextareaField
        control={form.control}
        name="note"
        placeholder={hint('Note')}
      />
      <NumberField
        control={form.control}
        name="qty"
        placeholder={hint('Quantity')}
      />
      <TextField
        control={form.control}
        name="date"
        type="date"
        placeholder={hint('Date hint')}
      />
      <TextField
        control={form.control}
        name="time"
        type="time"
        placeholder={hint('Time hint')}
      />
      <SelectField
        control={form.control}
        name="pick"
        options={OPTIONS}
        placeholder={hint('Pick one')}
      />
      <ComboboxField
        control={form.control}
        name="combo"
        options={OPTIONS}
        placeholder={hint('Search one')}
      />
      <PersonSelectField
        control={form.control}
        name="person"
        kind="EMPLOYEE"
        placeholder={hint('Choose person')}
      />
    </Form>
  );
}

afterEach(() => {
  setTestLanguage('en');
});

describe('field placeholders', () => {
  it('renders the placeholder of every field wrapper', () => {
    renderWithProviders(<Harness withPlaceholders />);
    expect(screen.getByPlaceholderText('Code')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Note')).toBeInTheDocument();
    expect(screen.getByPlaceholderText('Quantity')).toBeInTheDocument();
    expect(screen.getByText('Date hint')).toBeInTheDocument();
    expect(screen.getByText('Time hint')).toBeInTheDocument();
    expect(screen.getByText('Pick one')).toBeInTheDocument();
    expect(screen.getByText('Search one')).toBeInTheDocument();
    expect(screen.getByText('Choose person')).toBeInTheDocument();
  });

  it('falls back to a translated hint for pickers without a placeholder', () => {
    renderWithProviders(<Harness withPlaceholders={false} />);
    expect(screen.getByText(tt('common.pickDate'))).toBeInTheDocument();
    expect(screen.getByText(tt('common.pickTime'))).toBeInTheDocument();
    expect(screen.getAllByText(tt('common.select'))).toHaveLength(3);
  });

  it('uses the Arabic fallback hints', () => {
    setTestLanguage('ar');
    renderWithProviders(<Harness withPlaceholders={false} />);
    expect(screen.getByText(tt('common.pickDate'))).toBeInTheDocument();
    expect(screen.getByText(tt('common.pickTime'))).toBeInTheDocument();
    expect(screen.getAllByText('اختر')).toHaveLength(3);
  });

  it('shows the placeholder or the select fallback on SelectControl', () => {
    renderWithProviders(
      <>
        <SelectControl
          value="zzz"
          onChange={vi.fn()}
          options={OPTIONS}
          aria-label="First"
          placeholder="Choose first"
        />
        <SelectControl
          value="zzz"
          onChange={vi.fn()}
          options={OPTIONS}
          aria-label="Second"
        />
      </>,
    );
    expect(screen.getByText('Choose first')).toBeInTheDocument();
    expect(screen.getByText(tt('common.select'))).toBeInTheDocument();
  });
});
