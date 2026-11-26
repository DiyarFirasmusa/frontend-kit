import { HttpResponse, http } from 'msw';
import { beforeAll, describe, expect, it } from 'vitest';
import { Button } from '@/components/ui/button';
import { endpoints } from '@/constants/api';
import { PERMS } from '@/constants/permissions';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { signIn } from '@/test/fixtures/auth';
import { setTestLanguage, tt } from '@/test/i18n';
import { api } from '@/test/msw/handlers';
import { server } from '@/test/msw/server';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { useUnitOfMeasureFormDialog } from '../../hooks/form/use-uom-form-dialog';
import { makeUnitOfMeasure } from '../../uom-test-utils';
import { UnitOfMeasureFormDialog } from './uom-form-dialog';

function escapeRegExp(value: string): string {
  return value.replaceAll(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

function labelFor(key: string): RegExp {
  return new RegExp(`^${escapeRegExp(tt(key))}`);
}

function Harness() {
  const dialog = useUnitOfMeasureFormDialog();
  return (
    <>
      <Button onClick={dialog.openCreate}>open create</Button>
      <Button
        onClick={() => {
          dialog.openEdit(makeUnitOfMeasure());
        }}
      >
        open edit
      </Button>
      <UnitOfMeasureFormDialog dialog={dialog} />
    </>
  );
}

describe('UnitOfMeasureFormDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/units-of-measure');
  });

  it('shows the create title and save label in create mode', async () => {
    signIn({
      permissions: [PERMS.unitOfMeasure.create, PERMS.unitOfMeasure.update],
    });
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open create' }));

    expect(
      await screen.findByRole('dialog', {
        name: 'Create unit of measure',
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'Save unit' }),
    ).toBeInTheDocument();
  });

  it('shows the code and name errors when submitting an empty create form', async () => {
    signIn({
      permissions: [PERMS.unitOfMeasure.create, PERMS.unitOfMeasure.update],
    });
    let posted = false;
    server.use(
      http.post(api(endpoints.unitsOfMeasure.create), () => {
        posted = true;
        return HttpResponse.json(makeUnitOfMeasure(), { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open create' }));
    await screen.findByRole('dialog', {
      name: tt('unitsOfMeasure.form.createTitle'),
    });
    await user.click(
      screen.getByRole('button', { name: tt('unitsOfMeasure.form.submit') }),
    );

    expect(
      await screen.findByText(tt('unitsOfMeasure.form.errors.code')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('unitsOfMeasure.form.errors.name')),
    ).toBeInTheDocument();
    expect(posted).toBe(false);
  });

  it('shows the edit title and prefills the row after openEdit', async () => {
    signIn({
      permissions: [PERMS.unitOfMeasure.create, PERMS.unitOfMeasure.update],
    });
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open edit' }));

    expect(
      await screen.findByRole('dialog', {
        name: tt('unitsOfMeasure.form.editTitle'),
      }),
    ).toBeInTheDocument();
    expect(
      screen.getByLabelText(labelFor('unitsOfMeasure.form.code')),
    ).toHaveValue('KG');
    expect(
      screen.getByLabelText(labelFor('unitsOfMeasure.form.name')),
    ).toHaveValue('Kilogram');
    expect(
      screen.getByLabelText(labelFor('unitsOfMeasure.form.decimalPlaces')),
    ).toHaveValue('3');
    expect(
      screen.getByRole('switch', { name: tt('unitsOfMeasure.form.active') }),
    ).toBeChecked();
  });

  it('toggles the active switch', async () => {
    signIn({
      permissions: [PERMS.unitOfMeasure.create, PERMS.unitOfMeasure.update],
    });
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open create' }));
    const toggle = await screen.findByRole('switch', {
      name: tt('unitsOfMeasure.form.active'),
    });
    expect(toggle).toBeChecked();

    await user.click(toggle);
    expect(toggle).not.toBeChecked();
  });

  it('renders Arabic labels with literal Arabic strings when the language is ar', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/units-of-measure');
    signIn({
      permissions: [PERMS.unitOfMeasure.create, PERMS.unitOfMeasure.update],
    });
    const { user } = renderWithProviders(<Harness />);

    await user.click(screen.getByRole('button', { name: 'open create' }));
    expect(
      await screen.findByRole('dialog', { name: 'إنشاء وحدة قياس' }),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: 'حفظ الوحدة' }),
    ).toBeInTheDocument();
    expect(screen.getByLabelText(/^الرمز/)).toBeInTheDocument();
    expect(screen.getByRole('switch', { name: 'نشطة' })).toBeInTheDocument();
  });

  it('marks save busy and blocks Escape while the create request is pending', async () => {
    signIn({
      permissions: [PERMS.unitOfMeasure.create, PERMS.unitOfMeasure.update],
    });
    let release: (() => void) | undefined;
    const gate = new Promise<void>((resolve) => {
      release = resolve;
    });
    server.use(
      http.post(api(endpoints.unitsOfMeasure.create), async () => {
        await gate;
        return HttpResponse.json(makeUnitOfMeasure(), { status: 201 });
      }),
    );
    const { user } = renderWithProviders(<Harness />);

    try {
      await user.click(screen.getByRole('button', { name: 'open create' }));
      await user.type(
        await screen.findByLabelText(labelFor('unitsOfMeasure.form.code')),
        'box',
      );
      await user.type(
        screen.getByLabelText(labelFor('unitsOfMeasure.form.name')),
        'Box',
      );
      const submit = screen.getByRole('button', {
        name: tt('unitsOfMeasure.form.submit'),
      });
      await user.click(submit);

      await waitFor(() => {
        expect(submit).toHaveAttribute('aria-busy', 'true');
      });
      expect(submit).toBeDisabled();

      await user.keyboard('{Escape}');
      expect(
        screen.getByRole('dialog', {
          name: tt('unitsOfMeasure.form.createTitle'),
        }),
      ).toBeInTheDocument();
    } finally {
      release?.();
    }
    await waitFor(() => {
      expect(screen.queryByRole('dialog')).not.toBeInTheDocument();
    });
  });
});
