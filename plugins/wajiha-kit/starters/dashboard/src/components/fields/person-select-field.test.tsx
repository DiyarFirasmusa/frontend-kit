import { http, HttpResponse } from 'msw';
import { useEffect } from 'react';
import { useForm } from 'react-hook-form';
import { describe, expect, it, vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { endpoints } from '@/constants/api';
import { setTestLanguage, tt } from '@/test/i18n';
import {
  serveDirectoryNames,
  serveDirectorySearch,
} from '@/test/msw/directory';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { PersonSelectField } from './person-select-field';

const SARA = '6f1d2c3a-0000-4000-8000-000000000001';
const OMAR = '6f1d2c3a-0000-4000-8000-000000000002';
const PEOPLE = [
  { id: SARA, name: 'Sara Ali', subtitle: 'Storekeeper · Warehouse A' },
  { id: OMAR, name: 'Omar Hassan', subtitle: 'Driver' },
];

interface Values {
  employeeId: string;
}

interface HarnessProps {
  initial?: string;
  required?: boolean;
  placeholder?: string;
  onValue?: (value: string) => void;
}

function Harness({
  initial = '',
  required,
  placeholder,
  onValue,
}: HarnessProps) {
  const form = useForm<Values>({ defaultValues: { employeeId: initial } });
  useEffect(() => {
    const sub = form.watch((values) => {
      onValue?.(values.employeeId ?? '');
    });
    return () => {
      sub.unsubscribe();
    };
  }, [form, onValue]);
  return (
    <Form {...form}>
      <PersonSelectField
        control={form.control}
        name="employeeId"
        kind="EMPLOYEE"
        label="Employee"
        placeholder={placeholder}
        required={required}
      />
    </Form>
  );
}

describe('PersonSelectField', () => {
  it('sends no search until the popup opens', () => {
    const requests = serveDirectorySearch(PEOPLE);
    const { queryClient } = renderWithProviders(<Harness />);
    expect(queryClient.isFetching()).toBe(0);
    expect(requests).toHaveLength(0);
  });

  it('lists name and subtitle for the kind and stores the picked id', async () => {
    const requests = serveDirectorySearch(PEOPLE);
    const onValue = vi.fn();
    const { user } = renderWithProviders(<Harness onValue={onValue} />);

    await user.click(screen.getByRole('button', { name: /Employee/ }));
    const option = await screen.findByRole('option', { name: /Sara Ali/ });
    expect(option).toHaveTextContent('Storekeeper · Warehouse A');
    expect(requests[0]).toEqual({ kind: 'EMPLOYEE', q: null, limit: '20' });

    await user.click(option);
    expect(onValue).toHaveBeenLastCalledWith(SARA);
    expect(screen.getByRole('button', { name: /Employee/ })).toHaveTextContent(
      'Sara Ali',
    );
  });

  it('searches by the typed name after the debounce', async () => {
    const requests = serveDirectorySearch(PEOPLE);
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: /Employee/ }));
    await screen.findByRole('option', { name: /Omar Hassan/ });
    await user.type(
      screen.getByPlaceholderText(tt('common.searchByName')),
      'sar',
    );

    await waitFor(() => {
      expect(requests.at(-1)?.q).toBe('sar');
    });
    await waitFor(() => {
      expect(
        screen.queryByRole('option', { name: /Omar Hassan/ }),
      ).not.toBeInTheDocument();
    });
    expect(
      screen.getByRole('option', { name: /Sara Ali/ }),
    ).toBeInTheDocument();
  });

  it('shows the resolved name for an existing value instead of the uuid', async () => {
    serveDirectoryNames({ [SARA]: 'Sara Ali' });
    renderWithProviders(<Harness initial={SARA} />);

    const trigger = screen.getByRole('button', { name: /Employee/ });
    expect(trigger).not.toHaveTextContent(SARA.slice(0, 8));
    await waitFor(() => {
      expect(trigger).toHaveTextContent('Sara Ali');
    });
  });

  it('offers a none option to clear an optional field only', async () => {
    serveDirectorySearch(PEOPLE);
    const onValue = vi.fn();
    const { user } = renderWithProviders(
      <Harness initial={SARA} onValue={onValue} />,
    );

    await user.click(screen.getByRole('button', { name: /Employee/ }));
    await user.click(
      await screen.findByRole('option', { name: tt('common.none') }),
    );
    expect(onValue).toHaveBeenLastCalledWith('');
  });

  it('has no none option when required', async () => {
    serveDirectorySearch(PEOPLE);
    const { user } = renderWithProviders(<Harness required />);

    await user.click(screen.getByRole('button', { name: /Employee/ }));
    await screen.findByRole('option', { name: /Sara Ali/ });
    expect(
      screen.queryByRole('option', { name: tt('common.none') }),
    ).not.toBeInTheDocument();
  });

  it('shows the field hint instead of None while nothing is picked', async () => {
    serveDirectorySearch(PEOPLE);
    const { user } = renderWithProviders(
      <Harness placeholder="Choose staff" />,
    );

    const trigger = screen.getByRole('button', { name: /Employee/ });
    expect(trigger).toHaveTextContent('Choose staff');
    await user.click(trigger);
    await screen.findByRole('option', { name: /Sara Ali/ });
    expect(
      screen.queryByRole('option', { name: tt('common.none') }),
    ).not.toBeInTheDocument();
  });

  it('shows the load error row when the search fails', async () => {
    server.use(
      http.get(api(endpoints.directory.search), () =>
        HttpResponse.json({ message: 'boom' }, { status: 500 }),
      ),
    );
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: /Employee/ }));
    expect(await screen.findByText(tt('common.loadError'))).toBeInTheDocument();
  });

  it('renders the search placeholder in Arabic', async () => {
    serveDirectorySearch(PEOPLE);
    await setTestLanguage('ar');
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: /Employee/ }));
    expect(
      await screen.findByPlaceholderText(tt('common.searchByName')),
    ).toBeInTheDocument();
    await setTestLanguage('en');
  });
});
