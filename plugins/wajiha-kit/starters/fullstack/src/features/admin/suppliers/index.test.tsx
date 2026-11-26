import { http, HttpResponse } from 'msw';
import { useState } from 'react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';
import { publicEnv } from '@/shared/env/public-env';
import { useToastStore } from '@/shared/store/toast-store';
import { tt } from '@/test/i18n';
import { server } from '@/test/msw-server';
import { renderWithProviders, screen, waitFor, within } from '@/test/render';
import { PERMS } from '../constants/permissions';
import { startSession } from '../store/session';
import { SuppliersPage } from './index';
import type { SuppliersSearch } from './supplier-search';

function signIn(permissions: string[], roles: string[] = []): void {
  startSession({
    user: { id: 'u1', username: 'demo', name: 'Demo' },
    accessToken: 'mock-token-admin-test',
    roles,
    permissions,
  });
}

/** The page with its URL state held in memory, the way the route holds it in the address bar. */
const NO_SEARCH: SuppliersSearch = {};

function Harness({
  initial = NO_SEARCH,
  onChange,
}: {
  initial?: SuppliersSearch;
  onChange?: (next: SuppliersSearch) => void;
}) {
  const [search, setSearch] = useState<SuppliersSearch>(initial);
  return (
    <SuppliersPage
      search={search}
      onSearchChange={(next) => {
        onChange?.(next);
        setSearch(next);
      }}
    />
  );
}

/** A form label by its locale key (the label starts with the text; a required mark may follow). */
const label = (key: string): RegExp => new RegExp(`^${tt(key)}`, 'u');

const firstRows = async () => {
  const table = await screen.findByRole('table');
  await within(table).findByText('SUP-001');
  return table;
};

describe('suppliers page', () => {
  // The API client sends the page language (<html lang>) and the mock answers in it.
  beforeEach(() => {
    document.documentElement.lang = 'en';
  });
  afterEach(() => {
    document.documentElement.lang = '';
  });

  it('lists the first page from the API with paging', async () => {
    signIn([], ['admin']);
    renderWithProviders(<Harness />);
    const table = await firstRows();
    // 10 rows plus the header row.
    expect(within(table).getAllByRole('row')).toHaveLength(11);
    expect(screen.getByRole('navigation', { name: tt('ui.page') })).toBeInTheDocument();
  });

  it('writes the page number to the URL state', async () => {
    signIn([], ['admin']);
    const onChange = vi.fn();
    const { user } = renderWithProviders(<Harness onChange={onChange} />);
    await firstRows();
    await user.click(screen.getByRole('button', { name: '2' }));
    expect(onChange).toHaveBeenLastCalledWith({ page: 2 });
    expect(await screen.findByText('SUP-011')).toBeInTheDocument();
  });

  it('searches after a pause and resets to the first page', async () => {
    signIn([], ['admin']);
    const onChange = vi.fn();
    const { user } = renderWithProviders(<Harness initial={{ page: 2 }} onChange={onChange} />);
    await screen.findByText('SUP-011');
    await user.type(screen.getByRole('searchbox'), 'SUP-007');
    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith({ q: 'SUP-007', page: undefined });
    });
    const table = await screen.findByRole('table');
    await waitFor(() => {
      expect(within(table).getAllByRole('row')).toHaveLength(2);
    });
  });

  it('hides create, edit and delete from a read-only user', async () => {
    signIn([PERMS.supplier.read]);
    renderWithProviders(<Harness />);
    await firstRows();
    expect(screen.queryByRole('button', { name: tt('suppliers.create') })).not.toBeInTheDocument();
    expect(screen.queryByRole('columnheader', { name: tt('ui.actions') })).not.toBeInTheDocument();
  });

  it('creates a supplier through the dialog and shows it', async () => {
    signIn([], ['admin']);
    const { user } = renderWithProviders(<Harness />);
    await firstRows();
    await user.click(screen.getByRole('button', { name: tt('suppliers.create') }));
    const dialog = await screen.findByRole('dialog');
    await user.click(within(dialog).getByRole('button', { name: tt('ui.save') }));
    expect(await within(dialog).findByText(tt('suppliers.codeRequired'))).toBeInTheDocument();

    await user.type(within(dialog).getByLabelText(label('suppliers.fieldCode')), 'NEW-1');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldName')), 'Test Supplier');
    await user.click(within(dialog).getByRole('button', { name: tt('ui.save') }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('NEW-1')).toBeInTheDocument();
  });

  it('shows a taken code under the Code input and keeps the dialog open', async () => {
    signIn([], ['admin']);
    const { user } = renderWithProviders(<Harness />);
    await firstRows();
    await user.click(screen.getByRole('button', { name: tt('suppliers.create') }));
    const dialog = await screen.findByRole('dialog');
    // SUP-001 is in the seed data: the mock API answers 409 with an error on the "code" field.
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldCode')), 'SUP-001');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldName')), 'Copy');
    await user.click(within(dialog).getByRole('button', { name: tt('ui.save') }));

    const taken = await within(dialog).findByText('This supplier code is already used');
    // The message sits with the input it blames, and the input says so to assistive technology.
    const code = within(dialog).getByLabelText(label('suppliers.fieldCode'));
    expect(code).toHaveAttribute('aria-invalid', 'true');
    expect(code.closest('[data-slot="form-item"]')).toContainElement(taken);
    expect(screen.getByRole('dialog')).toBeInTheDocument();
    // One place for the error: a toast would repeat it.
    expect(useToastStore.getState().toasts).toEqual([]);
  });

  it('shows an error that blames no field as a toast and keeps the dialog open', async () => {
    signIn([], ['admin']);
    server.use(
      http.post(`${publicEnv.VITE_ADMIN_API_URL}/suppliers`, () =>
        HttpResponse.json({ message: 'The warehouse is closed' }, { status: 409 }),
      ),
    );
    const { user } = renderWithProviders(<Harness />);
    await firstRows();
    await user.click(screen.getByRole('button', { name: tt('suppliers.create') }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldCode')), 'NEW-9');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldName')), 'Copy');
    await user.click(within(dialog).getByRole('button', { name: tt('ui.save') }));

    await waitFor(() => {
      expect(useToastStore.getState().toasts).toEqual([
        expect.objectContaining({ tone: 'error', message: { text: 'The warehouse is closed' } }),
      ]);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });

  it('shows Spring-style field errors (errors[].defaultMessage) under their inputs', async () => {
    signIn([], ['admin']);
    server.use(
      http.post(`${publicEnv.VITE_ADMIN_API_URL}/suppliers`, () =>
        HttpResponse.json(
          {
            message: 'Validation failed',
            errors: [
              { field: 'name', defaultMessage: 'size must be between 3 and 255' },
              { field: 'notAnInput', defaultMessage: 'ignored: no such input' },
            ],
          },
          { status: 400 },
        ),
      ),
    );
    const { user } = renderWithProviders(<Harness />);
    await firstRows();
    await user.click(screen.getByRole('button', { name: tt('suppliers.create') }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldCode')), 'NEW-9');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldName')), 'ab');
    await user.click(within(dialog).getByRole('button', { name: tt('ui.save') }));

    expect(await within(dialog).findByText('size must be between 3 and 255')).toBeInTheDocument();
    expect(within(dialog).getByLabelText(label('suppliers.fieldName'))).toHaveAttribute(
      'aria-invalid',
      'true',
    );
    expect(within(dialog).getByLabelText(label('suppliers.fieldCode'))).not.toHaveAttribute(
      'aria-invalid',
      'true',
    );
  });

  it('keeps the entered values so the user can correct a taken code and save', async () => {
    signIn([], ['admin']);
    const { user } = renderWithProviders(<Harness />);
    await firstRows();
    await user.click(screen.getByRole('button', { name: tt('suppliers.create') }));
    const dialog = await screen.findByRole('dialog');
    const code = within(dialog).getByLabelText(label('suppliers.fieldCode'));
    await user.type(code, 'SUP-001');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldName')), 'Copy');
    await user.click(within(dialog).getByRole('button', { name: tt('ui.save') }));
    await within(dialog).findByText('This supplier code is already used');
    expect(within(dialog).getByLabelText(label('suppliers.fieldName'))).toHaveValue('Copy');

    await user.clear(code);
    await user.type(code, 'FREE-1');
    await user.click(within(dialog).getByRole('button', { name: tt('ui.save') }));
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
    expect(await screen.findByText('FREE-1')).toBeInTheDocument();
  });

  it('goes to the last page when the URL asks for one past the end', async () => {
    signIn([], ['admin']);
    const onChange = vi.fn();
    renderWithProviders(<Harness initial={{ page: 9 }} onChange={onChange} />);
    await waitFor(() => {
      expect(onChange).toHaveBeenCalledWith({ page: 3 });
    });
    expect(await screen.findByText('SUP-021')).toBeInTheDocument();
  });

  it('steps back a page when the last row of the last page is deleted', async () => {
    signIn([], ['admin']);
    const onChange = vi.fn();
    const { user } = renderWithProviders(<Harness initial={{ page: 3 }} onChange={onChange} />);
    // Page 3 holds SUP-021 to SUP-023.
    for (const code of ['SUP-021', 'SUP-022', 'SUP-023']) {
      const row = (await screen.findByText(code)).closest('tr');
      expect(row).not.toBeNull();
      await user.click(
        within(row as HTMLElement).getByRole('button', { name: tt('suppliers.delete') }),
      );
      const confirm = await screen.findByRole('dialog');
      await user.click(within(confirm).getByRole('button', { name: tt('suppliers.delete') }));
      await waitFor(() => {
        expect(screen.queryByText(code)).not.toBeInTheDocument();
      });
    }
    await waitFor(() => {
      expect(onChange).toHaveBeenLastCalledWith({ page: 2 });
    });
    expect(await screen.findByText('SUP-011')).toBeInTheDocument();
  });

  it('offers a retry when the list fails, and shows the rows after it works', async () => {
    signIn([], ['admin']);
    server.use(
      http.get(
        `${publicEnv.VITE_ADMIN_API_URL}/suppliers`,
        () => HttpResponse.json({}, { status: 500 }),
        { once: true },
      ),
    );
    const { user } = renderWithProviders(<Harness />);
    expect(await screen.findByText(tt('suppliers.loadError'))).toBeInTheDocument();
    await user.click(screen.getByRole('button', { name: tt('ui.tryAgain') }));
    expect(await screen.findByText('SUP-001')).toBeInTheDocument();
  });

  it('says "no access" instead of offering a retry when the API answers 403', async () => {
    signIn([], ['admin']);
    server.use(
      http.get(`${publicEnv.VITE_ADMIN_API_URL}/suppliers`, () =>
        HttpResponse.json({ message: 'no' }, { status: 403 }),
      ),
    );
    renderWithProviders(<Harness />);
    expect(await screen.findByText(tt('adminErrors.forbidden'))).toBeInTheDocument();
    expect(screen.queryByRole('button', { name: tt('ui.tryAgain') })).not.toBeInTheDocument();
  });

  it('shows the 403 of a change as an error toast and keeps the dialog open', async () => {
    // A tampered screen: the UI offers the button, the API says no.
    startSession({
      user: { id: 'u1', username: 'viewer', name: 'viewer' },
      accessToken: 'mock-token-viewer-test',
      // The screen thinks this is an administrator; the token is the viewer's, so the API refuses.
      roles: ['admin'],
      permissions: [],
    });
    const { user } = renderWithProviders(<Harness />);
    await firstRows();
    await user.click(screen.getByRole('button', { name: tt('suppliers.create') }));
    const dialog = await screen.findByRole('dialog');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldCode')), 'NEW-1');
    await user.type(within(dialog).getByLabelText(label('suppliers.fieldName')), 'Test Supplier');
    await user.click(within(dialog).getByRole('button', { name: tt('ui.save') }));
    await waitFor(() => {
      expect(useToastStore.getState().toasts.map((toast) => toast.tone)).toEqual(['error']);
    });
    expect(screen.getByRole('dialog')).toBeInTheDocument();
  });
});
