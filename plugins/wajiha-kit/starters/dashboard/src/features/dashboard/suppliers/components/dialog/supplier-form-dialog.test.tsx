import { useForm } from 'react-hook-form';
import { beforeAll, describe, expect, it, vi } from 'vitest';
import { Form } from '@/components/ui/form';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { zodResolver } from '@/lib/vendor/zod-resolver';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen } from '@/test/render';
import {
  defaultSupplierForm,
  supplierSchema,
  type SupplierValues,
} from '../../validations/validations';
import { SupplierFormDialog } from './supplier-form-dialog';

function Harness({
  isEditing = false,
  onSubmit,
}: {
  isEditing?: boolean;
  onSubmit: () => void;
}) {
  const form = useForm<SupplierValues>({
    resolver: zodResolver(supplierSchema),
    defaultValues: defaultSupplierForm,
  });
  return (
    <Form {...form}>
      <SupplierFormDialog
        open
        onOpenChange={vi.fn()}
        isEditing={isEditing}
        control={form.control}
        isPending={false}
        onSubmit={() => {
          void form.handleSubmit(onSubmit)();
        }}
      />
    </Form>
  );
}

describe('SupplierFormDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/suppliers');
  });

  it('shows the required errors and does not submit an empty form', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<Harness onSubmit={onSubmit} />);
    expect(
      screen.getByRole('heading', { name: tt('suppliers.dialog.createTitle') }),
    ).toBeInTheDocument();
    await user.click(
      screen.getByRole('button', { name: tt('suppliers.dialog.save') }),
    );
    expect(
      await screen.findByText(tt('suppliers.validation.codeRequired')),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('submits a valid supplier', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(<Harness onSubmit={onSubmit} />);
    await user.type(
      screen.getByLabelText(tt('suppliers.dialog.code'), { exact: false }),
      'SUP-9',
    );
    await user.type(
      screen.getByLabelText(tt('suppliers.dialog.name'), { exact: false }),
      'Acme',
    );
    await user.click(
      screen.getByRole('button', { name: tt('suppliers.dialog.save') }),
    );
    expect(onSubmit).toHaveBeenCalledOnce();
  });

  it('titles the edit dialog in Arabic', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/suppliers');
    renderWithProviders(<Harness isEditing onSubmit={vi.fn()} />);
    expect(
      screen.getByRole('heading', { name: 'تعديل المورد' }),
    ).toBeInTheDocument();
  });
});
