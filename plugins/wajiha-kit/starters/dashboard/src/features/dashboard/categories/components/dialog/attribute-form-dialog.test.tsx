import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import type { AttributeDefinitionResponse } from '@/types/api/catalog';
import { AttributeFormDialog } from './attribute-form-dialog';

function makeAttribute(
  overrides: Partial<AttributeDefinitionResponse> = {},
): AttributeDefinitionResponse {
  return {
    id: 'attr-weight',
    code: 'WEIGHT',
    name: 'Weight',
    dataType: 'NUMBER',
    unitLabel: 'kg',
    isActive: true,
    options: null,
    ...overrides,
  };
}

function renderDialog(
  props: Partial<Parameters<typeof AttributeFormDialog>[0]> = {},
) {
  const onSubmit = vi.fn();
  const onOpenChange = vi.fn();
  const view = renderWithProviders(
    <AttributeFormDialog
      open
      onOpenChange={onOpenChange}
      attribute={null}
      isPending={false}
      onSubmit={onSubmit}
      {...props}
    />,
  );
  return { ...view, onSubmit, onOpenChange };
}

describe('AttributeFormDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('shows the create defaults: TEXT type, active, no unit field', async () => {
    renderDialog();

    expect(
      await screen.findByLabelText(
        new RegExp(tt('categories.attributeForm.name')),
      ),
    ).toHaveValue('');
    expect(
      screen.queryByLabelText(new RegExp(tt('categories.attributeForm.code'))),
    ).not.toBeInTheDocument();
    expect(
      screen.getByText(tt('enums.AttributeDataType.TEXT')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('categories.attributeForm.statusActive')),
    ).toBeInTheDocument();
    expect(
      screen.queryByLabelText(
        new RegExp(tt('categories.attributeForm.unitLabel')),
      ),
    ).not.toBeInTheDocument();
  });

  it('shows the unit field only when the type is NUMBER', async () => {
    const { user } = renderDialog({ attribute: makeAttribute() });

    expect(
      await screen.findByLabelText(
        new RegExp(tt('categories.attributeForm.unitLabel')),
      ),
    ).toHaveValue('kg');
    expect(
      screen.getByText(tt('enums.AttributeDataType.NUMBER')),
    ).toBeInTheDocument();

    await user.click(screen.getByText(tt('enums.AttributeDataType.NUMBER')));
    await user.click(
      await screen.findByRole('option', {
        name: tt('enums.AttributeDataType.TEXT'),
      }),
    );

    await waitFor(() => {
      expect(
        screen.queryByLabelText(
          new RegExp(tt('categories.attributeForm.unitLabel')),
        ),
      ).not.toBeInTheDocument();
    });
  });

  it('shows the options hint in create mode when the type is OPTION', async () => {
    const { user } = renderDialog();

    await user.click(
      await screen.findByText(tt('enums.AttributeDataType.TEXT')),
    );
    await user.click(
      await screen.findByRole('option', {
        name: tt('enums.AttributeDataType.OPTION'),
      }),
    );

    expect(
      await screen.findByText(tt('categories.attributeForm.optionsHint')),
    ).toBeInTheDocument();
    expect(
      screen.getByText(tt('categories.attributeForm.usageNote')),
    ).toBeInTheDocument();
  });

  it('submits the entered values', async () => {
    const { user, onSubmit } = renderDialog();

    await user.type(
      await screen.findByLabelText(
        new RegExp(tt('categories.attributeForm.name')),
      ),
      'Material',
    );
    await user.click(
      screen.getByRole('button', {
        name: tt('categories.attributeForm.submit'),
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      code: '',
      name: 'Material',
      dataType: 'TEXT',
      unitLabel: '',
      status: 'ACTIVE',
    });
  });

  it('shows the required message when the name is missing', async () => {
    const { user, onSubmit } = renderDialog();

    await screen.findByLabelText(
      new RegExp(tt('categories.attributeForm.name')),
    );
    await user.click(
      screen.getByRole('button', {
        name: tt('categories.attributeForm.submit'),
      }),
    );

    expect(
      await screen.findByText(tt('categories.validation.required')),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('renders the Arabic title in edit mode', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    renderDialog({ attribute: makeAttribute() });

    expect(await screen.findByText('تعديل الخاصية')).toBeInTheDocument();
  });

  it('clears the unit label when the type is no longer NUMBER', async () => {
    const { user, onSubmit } = renderDialog({ attribute: makeAttribute() });

    await user.click(
      await screen.findByText(tt('enums.AttributeDataType.NUMBER')),
    );
    await user.click(
      await screen.findByRole('option', {
        name: tt('enums.AttributeDataType.TEXT'),
      }),
    );
    await user.click(
      screen.getByRole('button', {
        name: tt('categories.attributeForm.submit'),
      }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0]?.[0]).toEqual(
      expect.objectContaining({ dataType: 'TEXT', unitLabel: '' }),
    );
  });
});
