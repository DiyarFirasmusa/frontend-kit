import { beforeAll, describe, expect, it, vi } from 'vitest';
import { loadFeatureLocale } from '@/lib/i18n/i18n';
import { tt } from '@/test/i18n';
import { renderWithProviders, screen, waitFor } from '@/test/render';
import { AttributeFormDialog } from './attribute-form-dialog';

describe('AttributeFormDialog hidden unit label', () => {
  beforeAll(async () => {
    await loadFeatureLocale('dashboard/categories');
  });

  it('submits a TEXT attribute with an empty unit label even if the stored one is too long', async () => {
    const onSubmit = vi.fn();
    const { user } = renderWithProviders(
      <AttributeFormDialog
        open
        onOpenChange={vi.fn()}
        isPending={false}
        onSubmit={onSubmit}
        attribute={{
          id: 'attr-material',
          code: 'MATERIAL',
          name: 'Material',
          dataType: 'TEXT',
          unitLabel: 'x'.repeat(25),
          isActive: true,
          options: null,
        }}
      />,
    );

    await user.click(
      await screen.findByRole('button', {
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
