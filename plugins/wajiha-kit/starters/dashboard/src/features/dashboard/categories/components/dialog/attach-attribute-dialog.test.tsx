import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { setTestLanguage, tt } from '@/test/i18n';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { AttachAttributeDialog } from './attach-attribute-dialog';

const OPTIONS = [
  { value: 'attr-material', label: 'المادة (MATERIAL)' },
  { value: 'attr-weight', label: 'الوزن (WEIGHT)' },
];

function labelPattern(key: string): RegExp {
  return new RegExp(tt(key));
}

describe('AttachAttributeDialog', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('shows the required message when no attribute is chosen', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(
      <AttachAttributeDialog
        open
        onOpenChange={() => {}}
        attributeOptions={OPTIONS}
        isPending={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(
      screen.getByRole('button', { name: tt('categories.attach.submit') }),
    );

    expect(
      await screen.findByText(tt('categories.validation.attributeRequired')),
    ).toBeInTheDocument();
    expect(onSubmit).not.toHaveBeenCalled();
  });

  it('shows the empty message and disables submit when no attributes are available', () => {
    renderWithProviders(
      <AttachAttributeDialog
        open
        onOpenChange={() => {}}
        attributeOptions={[]}
        isPending={false}
        onSubmit={() => {}}
      />,
    );

    expect(
      screen.getByText(tt('categories.attach.noAvailable')),
    ).toBeInTheDocument();
    expect(
      screen.getByRole('button', { name: tt('categories.attach.submit') }),
    ).toBeDisabled();
  });

  it('submits the chosen attribute with both switch flags', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(
      <AttachAttributeDialog
        open
        onOpenChange={() => {}}
        attributeOptions={OPTIONS}
        isPending={false}
        onSubmit={onSubmit}
      />,
    );

    await user.click(
      screen.getByRole('combobox', {
        name: labelPattern('categories.attach.attribute'),
      }),
    );
    await user.click(
      await screen.findByRole('option', { name: 'المادة (MATERIAL)' }),
    );
    await user.click(
      screen.getByRole('switch', {
        name: labelPattern('categories.attach.isRequired'),
      }),
    );
    await user.click(
      screen.getByRole('switch', {
        name: labelPattern('categories.attach.isVariantAxis'),
      }),
    );
    await user.click(
      screen.getByRole('button', { name: tt('categories.attach.submit') }),
    );

    await waitFor(() => {
      expect(onSubmit).toHaveBeenCalledTimes(1);
    });
    expect(onSubmit.mock.calls[0]?.[0]).toEqual({
      attributeDefinitionId: 'attr-material',
      isRequired: true,
      isVariantAxis: true,
    });
  });

  it('renders the Arabic title', async () => {
    await setTestLanguage('ar');
    await loadFeatureLocale('dashboard/categories');
    try {
      renderWithProviders(
        <AttachAttributeDialog
          open
          onOpenChange={() => {}}
          attributeOptions={OPTIONS}
          isPending={false}
          onSubmit={() => {}}
        />,
      );

      expect(
        await screen.findByRole('dialog', {
          name: tt('categories.attach.title'),
        }),
      ).toBeInTheDocument();
      expect(tt('categories.attach.title')).toBe('ربط خاصية');
    } finally {
      await setTestLanguage('en');
    }
  });
});
